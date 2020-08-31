declare namespace fabric {
  interface StaticCanvas {
    /** Canvas original dimensions */
    originalSize?: { width: number; height: number }
  }

  interface IObjectOptions {
    /** Collaborator Id - user who created the object */
    createdBy?: string
    /** Collaborator Id - user that last modified the object */
    modifiedBy?: string
    /** When object was created in ms */
    createdTime?: number
    /** When object was last modified in ms */
    modifiedTime?: number
  }

  interface IGroupOptions {
    /** Shape name if the groupe represent a shape like an Arrow */
    shape?: string
  }

  //TODO: Remove when @types/fabric is updated to v4
  interface IEvent {
    selected?: fabric.Object[]
    deselected?: fabric.Object[]
  }
}

// Fix for "Property 'observable' does not exist on type 'SymbolConstructor'."
declare interface SymbolConstructor {
  readonly observable: symbol
}
