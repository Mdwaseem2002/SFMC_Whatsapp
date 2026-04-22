import { NextResponse } from 'next/server';
import connectMongoDB from '@/lib/mongodb';
import AutomationExecution from '@/models/AutomationExecution';
import AutomationJourney from '@/models/AutomationJourney';
import { POST as sendWhatsappPost } from '@/app/api/send-whatsapp/route';

export async function GET() {
  try {
    await connectMongoDB();

    // Find pending executions that are due
    const pending = await AutomationExecution.find({
      status: 'pending',
      executeAt: { $lte: new Date() },
    }).limit(50);

    let processed = 0;

    for (const exec of pending) {
      try {
        exec.status = 'running';
        await exec.save();

        // Load the journey
        const journey = await AutomationJourney.findById(exec.journeyId).lean();
        if (!journey || (journey as any).status !== 'active') {
          exec.status = 'failed';
          exec.executionLog.push({ nodeId: exec.currentNodeId, nodeType: 'unknown', executedAt: new Date(), result: 'Journey inactive or not found' });
          await exec.save();
          continue;
        }

        const nodes: any[] = (journey as any).nodes || [];
        const edges: any[] = (journey as any).edges || [];
        const currentNode = nodes.find((n: any) => n.id === exec.currentNodeId);

        if (!currentNode) {
          exec.status = 'completed';
          exec.executionLog.push({ nodeId: exec.currentNodeId, nodeType: 'end', executedAt: new Date(), result: 'Node not found — journey complete' });
          await exec.save();
          processed++;
          continue;
        }

        // ── Process node by type ──
        if (currentNode.type === 'send_template') {
          const templateName = currentNode.config?.templateName || '';
          const language = currentNode.config?.language || 'en';

          if (!templateName) {
            exec.executionLog.push({ nodeId: currentNode.id, nodeType: 'send_template', executedAt: new Date(), result: 'No template configured' });
            exec.status = 'failed';
            await exec.save();
            continue;
          }

          // Call existing send-whatsapp route directly
          const reqBody = JSON.stringify({
            phone: exec.contactPhone,
            templateName,
            language,
          });
          const mockReq = new Request('http://localhost/api/send-whatsapp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: reqBody
          });
          
          const sendRes = await sendWhatsappPost(mockReq);

          const sendData = await sendRes.json();
          const success = sendRes.ok && sendData.success;

          exec.executionLog.push({
            nodeId: currentNode.id,
            nodeType: 'send_template',
            executedAt: new Date(),
            result: success ? `Sent: ${sendData.wamid || 'ok'}` : `Failed: ${sendData.error || 'unknown'}`,
          });

          if (!success) {
            exec.status = 'failed';
            await exec.save();
            continue;
          }

          // Advance to next node
          const nextEdge = edges.find((e: any) => e.from === currentNode.id);
          if (nextEdge) {
            exec.currentNodeId = nextEdge.to;
            exec.status = 'pending';
            exec.executeAt = new Date(); // immediate
            await exec.save();
          } else {
            exec.status = 'completed';
            await exec.save();
          }

        } else if (currentNode.type === 'time_delay') {
          const amount = Number(currentNode.config?.amount) || 1;
          const unit = currentNode.config?.unit || 'Minutes';
          let delayMs = amount * 60 * 1000; // default minutes
          if (unit === 'Hours') delayMs = amount * 60 * 60 * 1000;
          if (unit === 'Days') delayMs = amount * 24 * 60 * 60 * 1000;

          exec.executionLog.push({
            nodeId: currentNode.id,
            nodeType: 'time_delay',
            executedAt: new Date(),
            result: `Waiting ${amount} ${unit}`,
          });

          // Advance to next node with delay
          const nextEdge = edges.find((e: any) => e.from === currentNode.id);
          if (nextEdge) {
            exec.currentNodeId = nextEdge.to;
            exec.status = 'pending';
            exec.executeAt = new Date(Date.now() + delayMs);
            await exec.save();
          } else {
            exec.status = 'completed';
            await exec.save();
          }

        } else if (currentNode.type === 'condition_split') {
          // For now: check if any message exists from this contact after journey started
          // Simple approach: YES path if contact has recent activity, NO otherwise
          const checkMinutes = Number(currentNode.config?.timeout) || 30;
          const sinceTime = new Date(exec.createdAt.getTime());

          // Try to find a reply message from the contact
          let hasReply = false;
          try {
            const MessageModel = (await import('@/models/Message')).default;
            const reply = await MessageModel.findOne({
              contactPhoneNumber: exec.contactPhone.replace(/[^0-9]/g, ''),
              sender: 'contact',
              timestamp: { $gte: sinceTime.toISOString() },
            }).lean();
            hasReply = !!reply;
          } catch { /* ignore */ }

          exec.executionLog.push({
            nodeId: currentNode.id,
            nodeType: 'condition_split',
            executedAt: new Date(),
            result: hasReply ? 'User replied → YES path' : 'No reply → NO path',
          });

          // Find YES or NO edge. Convention: first edge = YES, second = NO
          const outEdges = edges.filter((e: any) => e.from === currentNode.id);
          const targetEdge = hasReply ? outEdges[0] : outEdges[1] || outEdges[0];

          if (targetEdge) {
            exec.currentNodeId = targetEdge.to;
            exec.status = 'pending';
            exec.executeAt = new Date();
            await exec.save();
          } else {
            exec.status = 'completed';
            await exec.save();
          }

        } else {
          // Unknown node type or trigger — advance to next
          const nextEdge = edges.find((e: any) => e.from === currentNode.id);
          if (nextEdge) {
            exec.currentNodeId = nextEdge.to;
            exec.status = 'pending';
            exec.executeAt = new Date();
            await exec.save();
          } else {
            exec.status = 'completed';
            await exec.save();
          }
        }

        processed++;
      } catch (nodeErr: any) {
        exec.status = 'failed';
        exec.executionLog.push({ nodeId: exec.currentNodeId, nodeType: 'error', executedAt: new Date(), result: nodeErr.message });
        await exec.save();
      }
    }

    return NextResponse.json({ success: true, processed });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
