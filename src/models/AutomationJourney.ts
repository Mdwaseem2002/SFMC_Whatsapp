import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IAutomationNode {
  id: string;
  type: 'contact_created' | 'message_received' | 'manual' | 'send_template' | 'time_delay' | 'condition_split';
  position: { x: number; y: number };
  config: Record<string, any>;
}

export interface IAutomationEdge {
  from: string;
  to: string;
}

export interface IAutomationJourney extends Document {
  userId: string;
  workspaceId: string;
  name: string;
  status: 'draft' | 'active';
  nodes: IAutomationNode[];
  edges: IAutomationEdge[];
  createdAt: Date;
  updatedAt: Date;
}

const AutomationJourneySchema: Schema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    workspaceId: { type: String, required: true, index: true },
    name: { type: String, required: true, default: 'New Journey' },
    status: { type: String, enum: ['draft', 'active'], default: 'draft' },
    nodes: { type: [Schema.Types.Mixed], default: [] },
    edges: { type: [Schema.Types.Mixed], default: [] },
  },
  {
    timestamps: true,
    collection: 'automation_journeys',
  }
);

const AutomationJourney: Model<IAutomationJourney> =
  mongoose.models.AutomationJourney || mongoose.model<IAutomationJourney>('AutomationJourney', AutomationJourneySchema);

export default AutomationJourney;
