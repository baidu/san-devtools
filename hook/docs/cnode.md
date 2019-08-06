# San-DevHook CNode instance and DOM object

## Properties

### Public

  - ***id*** (*string*) A San component's unique ID.
  - ***name*** (*string*) A San component's name. If there is no `subTag` exist, the constructor name will be returned.
  - ***template*** (*string*) A San component's template.
  - ***parentTemplate*** (*string*) The parent component's template.
  - ***history*** (*Object*) The component's lastest history info.
  - ***route*** (*Object*) The component's route info if has.
  - ***callbacks*** (*Object*) The component's computed, computedDeps, filters, listeners and messages callback instances.
  - ***parentId*** (*string*) The parent component's unique ID.
  - ***data*** (*Object*) The component's data instace.
  - ***props*** (*Array*) The component's props info.
  - ***treeData*** (by config.subKey) (*Array*) The children components instances.
  - ***ancestorIndexList*** (*string*) Ancestor's index of their parent.
  


### Private

  - ***_subKey*** (*string*) Key for the array of sub component tree.
    - Default: `treeData`
  - ***_domChildrenKey*** (*string*) Key for the array of dom attached components.
    - Default: `domChildren`
  - ***_lastMessage*** (*string*) Last message triggered on the component.


## Methods

#### getParent()
Return parent component's CNode or null.

#### getNext()
Return next sibling component's CNode or null.

#### getPrevious()
Return previous sibling component's CNode or null.

#### getDOMChildren()
Return attached DOM children components if has.

#### showTree()
Display the component tree under current CNode.


## Objects binding on DOM

  - `__SAN_COMPONENT__`: The component instance of current DOM object.
  - `__SAN_DATA__`: The component data.
  - `__SAN_PROPS__`: The component props.
  - `__SAN_CNODE__`: A CNode instance of component acts as a serializable object.
  - `__SAN_PATH__`: Ancestor component ID list.
  - `showTree()`: Display the component tree under current DOM object.
