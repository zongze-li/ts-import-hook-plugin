import React from 'react';
import { Alert, Affix as S, AutoComplete } from 'antd';
import { Drawer, MenuItemProps } from 'material-ui';
import { OtherComponent } from './other';
import { forEach } from 'lodash';
import { skip, take, switchMap as SwitchMap } from 'rxjs/operators';
import { EN_ConsumeItem, EN_Reimburse, EN_ReimburseUnCompleteView } from "@q7/athena-gen/src/entity-names";
import { ENUM_BillStatus_draft, ENUM_BillStatus_effective, ENUM_BillStatus_restarted } from "@q7/athena-gen/src/enums";
import { F_ConsumeItem_createdTime, F_ConsumeItem_isGeneratedReimburse } from "@q7/athena-gen/src/entity-fields/ConsumeItem";
import { F_ConsumeItem1_isGeneratedReimburse } from "@q7/athena-gen/src/entity-fields/ConsumeItem1";
export class Test extends React.PureComponent<void, void> {
    render() {
        return (<OtherComponent>
        <Alert message='hello world'/>
      </OtherComponent>);
    }
}
