/**
 * @license
 * Copyright Color-Coding Studio. All Rights Reserved.
 *
 * Use of this source code is governed by an Apache License, Version 2.0
 * that can be found in the LICENSE file at http://www.apache.org/licenses/LICENSE-2.0
 */
namespace receiptpayment {
    export namespace app {

        /** 编辑应用-付款 */
        export class PaymentEditApp extends ibas.BOEditApplication<IPaymentEditView, bo.Payment> {

            /** 应用标识 */
            static APPLICATION_ID: string = "101d5699-904c-49b7-9ae4-0f6f3eea0f7c";
            /** 应用名称 */
            static APPLICATION_NAME: string = "receiptpayment_app_payment_edit";
            /** 业务对象编码 */
            static BUSINESS_OBJECT_CODE: string = bo.Payment.BUSINESS_OBJECT_CODE;
            /** 构造函数 */
            constructor() {
                super();
                this.id = PaymentEditApp.APPLICATION_ID;
                this.name = PaymentEditApp.APPLICATION_NAME;
                this.boCode = PaymentEditApp.BUSINESS_OBJECT_CODE;
                this.description = ibas.i18n.prop(this.name);
            }
            /** 注册视图 */
            protected registerView(): void {
                super.registerView();
                // 其他事件
                this.view.deleteDataEvent = this.deleteData;
                this.view.createDataEvent = this.createData;
                this.view.addPaymentItemEvent = this.addPaymentItem;
                this.view.removePaymentItemEvent = this.removePaymentItem;
                this.view.choosePaymentBusinessPartnerEvent = this.choosePaymentBusinessPartner;
                this.view.choosePaymentItemPurchaseOrderEvent = this.choosePaymentItemPurchaseOrder;
                this.view.choosePaymentItemPurchaseDeliveryEvent = this.choosePaymentItemPurchaseDelivery;
                this.view.choosePaymentItemSalesReturnEvent = this.choosePaymentItemSalesReturn;
                this.view.choosePaymentItemModeTradeIdEvent = this.choosePaymentItemModeTradeId;
            }
            /** 视图显示后 */
            protected viewShowed(): void {
                // 视图加载完成
                if (ibas.objects.isNull(this.editData)) {
                    // 创建编辑对象实例
                    this.editData = new bo.Payment();
                    this.proceeding(ibas.emMessageType.WARNING, ibas.i18n.prop("shell_data_created_new"));
                }
                this.view.showPayment(this.editData);
                this.view.showPaymentItems(this.editData.paymentItems.filterDeleted());
            }
            /** 运行,覆盖原方法 */
            run(): void;
            run(data: bo.Payment): void;
            run(): void {
                let that: this = this;
                if (ibas.objects.instanceOf(arguments[0], bo.Payment)) {
                    let data: bo.Payment = arguments[0];
                    // 新对象直接编辑
                    if (data.isNew) {
                        that.editData = data;
                        that.show();
                        return;
                    }
                    // 尝试重新查询编辑对象
                    let criteria: ibas.ICriteria = data.criteria();
                    if (!ibas.objects.isNull(criteria) && criteria.conditions.length > 0) {
                        // 有效的查询对象查询
                        let boRepository: bo.BORepositoryReceiptPayment = new bo.BORepositoryReceiptPayment();
                        boRepository.fetchPayment({
                            criteria: criteria,
                            onCompleted(opRslt: ibas.IOperationResult<bo.Payment>): void {
                                let data: bo.Payment;
                                if (opRslt.resultCode === 0) {
                                    data = opRslt.resultObjects.firstOrDefault();
                                }
                                if (ibas.objects.instanceOf(data, bo.Payment)) {
                                    // 查询到了有效数据
                                    that.editData = data;
                                    that.show();
                                } else {
                                    // 数据重新检索无效
                                    that.messages({
                                        type: ibas.emMessageType.WARNING,
                                        message: ibas.i18n.prop("shell_data_deleted_and_created"),
                                        onCompleted(): void {
                                            that.show();
                                        }
                                    });
                                }
                            }
                        });
                        // 开始查询数据
                        return;
                    }
                }
                super.run.apply(this, arguments);
            }
            /** 待编辑的数据 */
            protected editData: bo.Payment;
            /** 保存数据 */
            protected saveData(): void {
                let that: this = this;
                let boRepository: bo.BORepositoryReceiptPayment = new bo.BORepositoryReceiptPayment();
                boRepository.savePayment({
                    beSaved: this.editData,
                    onCompleted(opRslt: ibas.IOperationResult<bo.Payment>): void {
                        try {
                            that.busy(false);
                            if (opRslt.resultCode !== 0) {
                                throw new Error(opRslt.message);
                            }
                            if (opRslt.resultObjects.length === 0) {
                                // 删除成功，释放当前对象
                                that.messages(ibas.emMessageType.SUCCESS,
                                    ibas.i18n.prop("shell_data_delete") + ibas.i18n.prop("shell_sucessful"));
                                that.editData = undefined;
                            } else {
                                // 替换编辑对象
                                that.editData = opRslt.resultObjects.firstOrDefault();
                                that.messages(ibas.emMessageType.SUCCESS,
                                    ibas.i18n.prop("shell_data_save") + ibas.i18n.prop("shell_sucessful"));
                            }
                            // 刷新当前视图
                            that.viewShowed();
                        } catch (error) {
                            that.messages(error);
                        }
                    }
                });
                this.busy(true);
                this.proceeding(ibas.emMessageType.INFORMATION, ibas.i18n.prop("shell_saving_data"));
            }
            /** 删除数据 */
            protected deleteData(): void {
                let that: this = this;
                this.messages({
                    type: ibas.emMessageType.QUESTION,
                    title: ibas.i18n.prop(this.name),
                    message: ibas.i18n.prop("shell_delete_continue"),
                    actions: [ibas.emMessageAction.YES, ibas.emMessageAction.NO],
                    onCompleted(action: ibas.emMessageAction): void {
                        if (action === ibas.emMessageAction.YES) {
                            that.editData.delete();
                            that.saveData();
                        }
                    }
                });
            }
            /** 新建数据，参数1：是否克隆 */
            protected createData(clone: boolean): void {
                let that: this = this;
                let createData: Function = function (): void {
                    if (clone) {
                        // 克隆对象
                        that.editData = that.editData.clone();
                        that.proceeding(ibas.emMessageType.WARNING, ibas.i18n.prop("shell_data_cloned_new"));
                        that.viewShowed();
                    } else {
                        // 新建对象
                        that.editData = new bo.Payment();
                        that.proceeding(ibas.emMessageType.WARNING, ibas.i18n.prop("shell_data_created_new"));
                        that.viewShowed();
                    }
                };
                if (that.editData.isDirty) {
                    this.messages({
                        type: ibas.emMessageType.QUESTION,
                        title: ibas.i18n.prop(this.name),
                        message: ibas.i18n.prop("shell_data_not_saved_continue"),
                        actions: [ibas.emMessageAction.YES, ibas.emMessageAction.NO],
                        onCompleted(action: ibas.emMessageAction): void {
                            if (action === ibas.emMessageAction.YES) {
                                createData();
                            }
                        }
                    });
                } else {
                    createData();
                }
            }
            /** 添加付款-项目事件 */
            private addPaymentItem(): void {
                this.editData.paymentItems.create();
                // 仅显示没有标记删除的
                this.view.showPaymentItems(this.editData.paymentItems.filterDeleted());
            }
            /** 删除付款-项目事件 */
            private removePaymentItem(items: bo.PaymentItem[]): void {
                // 非数组，转为数组
                if (!(items instanceof Array)) {
                    items = [items];
                }
                if (items.length === 0) {
                    return;
                }
                // 移除项目
                for (let item of items) {
                    if (this.editData.paymentItems.indexOf(item) >= 0) {
                        if (item.isNew) {
                            // 新建的移除集合
                            this.editData.paymentItems.remove(item);
                        } else {
                            // 非新建标记删除
                            item.delete();
                        }
                    }
                }
                // 仅显示没有标记删除的
                this.view.showPaymentItems(this.editData.paymentItems.filterDeleted());
            }

            /** 选择付款客户事件 */
            private choosePaymentBusinessPartner(): void {
                let that: this = this;
                if (this.editData.businessPartnerType === businesspartner.bo.emBusinessPartnerType.CUSTOMER) {
                    ibas.servicesManager.runChooseService<businesspartner.bo.ICustomer>({
                        boCode: businesspartner.bo.BO_CODE_CUSTOMER,
                        chooseType: ibas.emChooseType.SINGLE,
                        criteria: businesspartner.app.conditions.customer.create(),
                        onCompleted(selecteds: ibas.IList<businesspartner.bo.ICustomer>): void {
                            let selected: businesspartner.bo.ICustomer = selecteds.firstOrDefault();
                            that.editData.businessPartnerCode = selected.code;
                            that.editData.businessPartnerName = selected.name;
                            that.editData.contactPerson = selected.contactPerson;
                        }
                    });
                } else if (this.editData.businessPartnerType === businesspartner.bo.emBusinessPartnerType.SUPPLIER) {
                    ibas.servicesManager.runChooseService<businesspartner.bo.ISupplier>({
                        boCode: businesspartner.bo.BO_CODE_SUPPLIER,
                        chooseType: ibas.emChooseType.SINGLE,
                        criteria: businesspartner.app.conditions.supplier.create(),
                        onCompleted(selecteds: ibas.IList<businesspartner.bo.ISupplier>): void {
                            let selected: businesspartner.bo.ICustomer = selecteds.firstOrDefault();
                            that.editData.businessPartnerCode = selected.code;
                            that.editData.businessPartnerName = selected.name;
                            that.editData.contactPerson = selected.contactPerson;
                        }
                    });
                }
            }
            /** 选择付款项目-采购订单 */
            private choosePaymentItemPurchaseOrder(): void {
                if (ibas.objects.isNull(this.editData) || ibas.strings.isEmpty(this.editData.businessPartnerCode)) {
                    this.messages(ibas.emMessageType.WARNING, ibas.i18n.prop("shell_please_chooose_data",
                        ibas.i18n.prop("bo_payment_businesspartnercode")
                    ));
                    return;
                }
                let criteria: ibas.ICriteria = new ibas.Criteria();
                // 不查子项
                criteria.noChilds = true;
                let condition: ibas.ICondition = criteria.conditions.create();
                // 未取消的
                condition.alias = ibas.BO_PROPERTY_NAME_CANCELED;
                condition.operation = ibas.emConditionOperation.EQUAL;
                condition.value = ibas.emYesNo.NO.toString();
                // 未删除的
                condition = criteria.conditions.create();
                condition.alias = ibas.BO_PROPERTY_NAME_DELETED;
                condition.operation = ibas.emConditionOperation.EQUAL;
                condition.value = ibas.emYesNo.NO.toString();
                // 未结算的
                condition = criteria.conditions.create();
                condition.alias = ibas.BO_PROPERTY_NAME_DOCUMENTSTATUS;
                condition.operation = ibas.emConditionOperation.NOT_EQUAL;
                condition.value = ibas.emDocumentStatus.CLOSED.toString();
                // 当前供应商的
                condition.alias = "SupplierCode";
                condition.operation = ibas.emConditionOperation.EQUAL;
                condition.value = this.editData.businessPartnerCode;
                // 未收全款的
                condition = criteria.conditions.create();
                condition.alias = "DocumentTotal";
                condition.operation = ibas.emConditionOperation.GRATER_THAN;
                condition.comparedAlias = "PaidTotal";
                // 调用选择服务
                let that: this = this;
                ibas.servicesManager.runChooseService<purchase.bo.IPurchaseOrder>({
                    boCode: purchase.bo.BO_CODE_PURCHASEORDER,
                    chooseType: ibas.emChooseType.MULTIPLE,
                    criteria: criteria,
                    onCompleted(selecteds: ibas.IList<purchase.bo.IPurchaseOrder>): void {
                        for (let selected of selecteds) {
                            let item: bo.PaymentItem = that.editData.paymentItems.create();
                            item.baseDocumentType = selected.objectCode;
                            item.baseDocumentEntry = selected.docEntry;
                            item.baseDocumentLineId = -1;
                            item.amount = selected.documentTotal - selected.paidTotal;
                            item.currency = selected.documentCurrency;
                        }
                        that.view.showPaymentItems(that.editData.paymentItems.filterDeleted());
                    }
                });
            }
            /** 选择付款项目-采购收货 */
            private choosePaymentItemPurchaseDelivery(): void {
                if (ibas.objects.isNull(this.editData) || ibas.strings.isEmpty(this.editData.businessPartnerCode)) {
                    this.messages(ibas.emMessageType.WARNING, ibas.i18n.prop("shell_please_chooose_data",
                        ibas.i18n.prop("bo_payment_businesspartnercode")
                    ));
                    return;
                }
                let criteria: ibas.ICriteria = new ibas.Criteria();
                // 不查子项
                criteria.noChilds = true;
                let condition: ibas.ICondition = criteria.conditions.create();
                // 未取消的
                condition.alias = ibas.BO_PROPERTY_NAME_CANCELED;
                condition.operation = ibas.emConditionOperation.EQUAL;
                condition.value = ibas.emYesNo.NO.toString();
                // 未删除的
                condition = criteria.conditions.create();
                condition.alias = ibas.BO_PROPERTY_NAME_DELETED;
                condition.operation = ibas.emConditionOperation.EQUAL;
                condition.value = ibas.emYesNo.NO.toString();
                // 未结算的
                condition = criteria.conditions.create();
                condition.alias = ibas.BO_PROPERTY_NAME_DOCUMENTSTATUS;
                condition.operation = ibas.emConditionOperation.NOT_EQUAL;
                condition.value = ibas.emDocumentStatus.CLOSED.toString();
                // 当前供应商的
                condition.alias = "SupplierCode";
                condition.operation = ibas.emConditionOperation.EQUAL;
                condition.value = this.editData.businessPartnerCode;
                // 未收全款的
                condition = criteria.conditions.create();
                condition.alias = "DocumentTotal";
                condition.operation = ibas.emConditionOperation.GRATER_THAN;
                condition.comparedAlias = "PaidTotal";
                // 调用选择服务
                let that: this = this;
                ibas.servicesManager.runChooseService<purchase.bo.IPurchaseDelivery>({
                    boCode: purchase.bo.BO_CODE_PURCHASEDELIVERY,
                    chooseType: ibas.emChooseType.MULTIPLE,
                    criteria: criteria,
                    onCompleted(selecteds: ibas.IList<purchase.bo.IPurchaseDelivery>): void {
                        for (let selected of selecteds) {
                            let item: bo.PaymentItem = that.editData.paymentItems.create();
                            item.baseDocumentType = selected.objectCode;
                            item.baseDocumentEntry = selected.docEntry;
                            item.baseDocumentLineId = -1;
                            item.amount = selected.documentTotal - selected.paidTotal;
                            item.currency = selected.documentCurrency;
                        }
                        that.view.showPaymentItems(that.editData.paymentItems.filterDeleted());
                    }
                });
            }
            /** 选择付款项目-销售退货 */
            private choosePaymentItemSalesReturn(): void {
                if (ibas.objects.isNull(this.editData) || ibas.strings.isEmpty(this.editData.businessPartnerCode)) {
                    this.messages(ibas.emMessageType.WARNING, ibas.i18n.prop("shell_please_chooose_data",
                        ibas.i18n.prop("bo_payment_businesspartnercode")
                    ));
                    return;
                }
                let criteria: ibas.ICriteria = new ibas.Criteria();
                // 不查子项
                criteria.noChilds = true;
                let condition: ibas.ICondition = criteria.conditions.create();
                // 未取消的
                condition.alias = ibas.BO_PROPERTY_NAME_CANCELED;
                condition.operation = ibas.emConditionOperation.EQUAL;
                condition.value = ibas.emYesNo.NO.toString();
                // 未删除的
                condition = criteria.conditions.create();
                condition.alias = ibas.BO_PROPERTY_NAME_DELETED;
                condition.operation = ibas.emConditionOperation.EQUAL;
                condition.value = ibas.emYesNo.NO.toString();
                // 未结算的
                condition = criteria.conditions.create();
                condition.alias = ibas.BO_PROPERTY_NAME_DOCUMENTSTATUS;
                condition.operation = ibas.emConditionOperation.NOT_EQUAL;
                condition.value = ibas.emDocumentStatus.CLOSED.toString();
                // 当前客户的
                condition = criteria.conditions.create();
                condition.alias = "CustomerCode";
                condition.operation = ibas.emConditionOperation.EQUAL;
                condition.value = this.editData.businessPartnerCode;
                // 未收全款的
                condition = criteria.conditions.create();
                condition.alias = "DocumentTotal";
                condition.operation = ibas.emConditionOperation.GRATER_THAN;
                condition.comparedAlias = "PaidTotal";
                // 调用选择服务
                let that: this = this;
                ibas.servicesManager.runChooseService<sales.bo.ISalesReturn>({
                    boCode: sales.bo.BO_CODE_SALESRETURN,
                    chooseType: ibas.emChooseType.MULTIPLE,
                    criteria: criteria,
                    onCompleted(selecteds: ibas.IList<sales.bo.ISalesReturn>): void {
                        for (let selected of selecteds) {
                            let item: bo.PaymentItem = that.editData.paymentItems.create();
                            item.baseDocumentType = selected.objectCode;
                            item.baseDocumentEntry = selected.docEntry;
                            item.baseDocumentLineId = -1;
                            item.amount = selected.documentTotal - selected.paidTotal;
                            item.currency = selected.documentCurrency;
                        }
                        that.view.showPaymentItems(that.editData.paymentItems.filterDeleted());
                    }
                });
            }
            /** 选择付款项目-交易标识 */
            private choosePaymentItemModeTradeId(data: bo.PaymentItem): void {
                if (ibas.objects.isNull(data) || ibas.objects.isNull(this.editData)) {
                    return;
                }
                // 业务伙伴资产查询
                if (data.mode === TRADING_MODE_BP_ASSSET) {
                    // 调用选择服务
                    ibas.servicesManager.runChooseService<businesspartner.bo.IBusinessPartnerAsset>({
                        boCode: businesspartner.bo.BO_CODE_BUSINESSPARTNERASSET,
                        chooseType: ibas.emChooseType.SINGLE,
                        criteria: businesspartner.app.conditions.businesspartnerasset.create(this.editData.businessPartnerType, this.editData.businessPartnerCode),
                        onCompleted(selecteds: ibas.IList<businesspartner.bo.IBusinessPartnerAsset>): void {
                            let selected: businesspartner.bo.IBusinessPartnerAsset = selecteds.firstOrDefault();
                            data.tradeId = selected.code;
                        }
                    });
                }
            }
        }
        /** 视图-付款 */
        export interface IPaymentEditView extends ibas.IBOEditView {
            /** 显示数据 */
            showPayment(data: bo.Payment): void;
            /** 删除数据事件 */
            deleteDataEvent: Function;
            /** 新建数据事件，参数1：是否克隆 */
            createDataEvent: Function;
            /** 选择付款客户事件 */
            choosePaymentBusinessPartnerEvent: Function;
            /** 添加付款-项目事件 */
            addPaymentItemEvent: Function;
            /** 删除付款-项目事件 */
            removePaymentItemEvent: Function;
            /** 显示数据 */
            showPaymentItems(datas: bo.PaymentItem[]): void;
            /** 选择付款项目-采购订单 */
            choosePaymentItemPurchaseOrderEvent: Function;
            /** 选择付款项目-采购收货 */
            choosePaymentItemPurchaseDeliveryEvent: Function;
            /** 选择付款项目-销售退货 */
            choosePaymentItemSalesReturnEvent: Function;
            /** 选择付款方式项目 */
            choosePaymentItemModeTradeIdEvent: Function;
        }
    }
}