declare namespace fabric {
  interface IObjectOptions {
    createdBy?: string
    modifiedBy?: string
    createdTime?: number
    modifiedTime?: number
  }

  interface IGroupOptions {
    shape?: string
  }

  interface IEvent {
    selected?: fabric.Object[]
    deselected?: fabric.Object[]
  }
}

// Fix for "Property 'observable' does not exist on type 'SymbolConstructor'."
declare interface SymbolConstructor {
  readonly observable: symbol
}
