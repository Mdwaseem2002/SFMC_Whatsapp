import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IExecutionLog {
  nodeId: string;
  nodeType: string;
  executedAt: Date;
  result: string;
}

export interface IAutomationExecution extends Document {
  journeyId: string;
  contactId: string;
  contactPhone: string;
  contactName: string;
  workspaceId: string;
  userId: string;
  currentNodeId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  executeAt: Date;
  executionLog: IExecutionLog[];
  createdAt: Date;
  updatedAt: Date;
}

const AutomationExecutionSchema: Schema = new Schema(
  {
    journeyId: { type: String, required: true, index: true },
    contactId: { type: String, required: true },
    contactPhone: { type: String, required: true },
    contactName: { type: String, default: '' },
    workspaceId: { type: String, required: true, index: true },
    userId: { type: String, required: true },
    currentNodeId: { type: String, required: true },
    status: {
      type: String,
      enum: ['pending', 'running', 'completed', 'failed'],
      default: 'pending',
      index: true,
    },
    executeAt: { type: Date, required: true, index: true },
    executionLog: [{
      nodeId: String,
      nodeType: String,
      executedAt: { type: Date, default: Date.now },
      result: String,
    }],
  },
  { timestamps: true, collection: 'automation_executions' }
);

AutomationExecutionSchema.index({ status: 1, executeAt: 1 });

const AutomationExecution: Model<IAutomationExecution> =
  mongoose.models.AutomationExecution || mongoose.model<IAutomationExecution>('AutomationExecution', AutomationExecutionSchema);

export default AutomationExecution;
