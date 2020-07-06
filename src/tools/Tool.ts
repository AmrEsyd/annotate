import { IObjectOptions } from 'fabric/fabric-impl'

export abstract class CanvasTool {
  constructor(public canvas: fabric.Canvas) {}
  abstract name: string
  protected props?: IObjectOptions
  abstract configureCanvas?(props: IObjectOptions): void
  abstract onMouseUp?(event: fabric.IEvent): void
  abstract onMouseDown?(event: fabric.IEvent): void
  abstract onMouseMove?(event: fabric.IEvent): void
}
