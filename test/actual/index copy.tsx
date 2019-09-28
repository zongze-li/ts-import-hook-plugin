import React from 'react';
import Alert from "antd/lib/alert";
import "antd/lib/alert/style/index.js";
import { default as S } from "antd/lib/affix";
import "antd/lib/affix/style/index.js";
import AutoComplete from "antd/lib/auto-complete";
import "antd/lib/auto-complete/style/index.js";
import { Drawer, MenuItemProps } from 'material-ui';
import { OtherComponent } from './other';
import { forEach } from 'lodash';
// import {
// 	EN_ConsumeItem,
// 	EN_Reimburse,
// 	EN_ReimburseUnCompleteView,
// 	// } from "@q7/athena-gen/lib/entity-names";
// } from "@q7/athena-gen/lib/";
// import {
// 	ENUM_BillStatus_draft, ENUM_BillStatus_effective, ENUM_BillStatus_restarted,
// // } from "@q7/athena-gen/lib/enums";
// } from "@q7/athena-gen/lib";
// import {
// 	F_ConsumeItem_createdTime,
// 	F_ConsumeItem_isGeneratedReimburse,
// // } from "@q7/athena-gen/lib/entity-fields/ConsumeItem";
// } from "@q7/athena-gen/lib/entity-fields";
import { skip, take, switchMap as SwitchMap } from 'rxjs/operators';
export class Test extends React.PureComponent<void, void> {
    render() {
        return (<OtherComponent>
        <Alert message='hello world'/>
      </OtherComponent>);
    }
}
