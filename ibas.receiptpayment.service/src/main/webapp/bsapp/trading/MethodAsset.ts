/**
 * @license
 * Copyright Color-Coding Studio. All Rights Reserved.
 *
 * Use of this source code is governed by an Apache License, Version 2.0
 * that can be found in the LICENSE file at http://www.apache.org/licenses/LICENSE-2.0
 */

namespace receiptpayment {
    export namespace app {
        /** 交易方式-业务伙伴资产 */
        export const TRADING_MODE_BP_ASSSET: string = "TM_BPAS";
        /**
         * 收款方式-业务伙伴资产
         */
        export class ReceiptMethodBPAsset extends ReceiptMethod {
            constructor() {
                super();
                this.id = "bd959445-66a0-4760-be0a-2be36bfeec01";
                this.name = TRADING_MODE_BP_ASSSET;
                this.description = ibas.i18n.prop("receiptpayment_method_bp_asset");
                this.enabled = !ibas.config.get(ibas.strings.format(CONFIG_ITEM_TEMPLATE_TRADING_MODE_DISABLED, this.name), false);
                this.noTrade = true;
            }
            /** 获取可用交易类型 */
            getTradings(caller: IReceiptTradingGetter): void {
                let that: this = this;
                let boRepository: businesspartner.bo.IBORepositoryBusinessPartner = ibas.boFactory.create(businesspartner.bo.BO_REPOSITORY_BUSINESSPARTNER);
                boRepository.fetchCustomerAsset({
                    request: {
                        businessPartner: caller.businessPartnerCode,
                        documentType: caller.documentType,
                        documentEntry: caller.documentEntry,
                        documentLineId: caller.documentLineId,
                        total: caller.documentTotal,
                        currency: caller.documentCurrency
                    },
                    onCompleted(opRsltAsset: ibas.IOperationResult<businesspartner.bo.ICustomerAsset>): void {
                        let opRslt: ibas.IOperationResult<IReceiptTradingMethod> = new ibas.OperationResult<IReceiptTradingMethod>();
                        if (opRsltAsset.resultCode !== 0) {
                            opRslt.resultCode = -1;
                            opRslt.message = opRsltAsset.message;
                        } else {
                            for (let item of opRsltAsset.resultObjects) {
                                let trading: IReceiptTradingMethod = new ReceiptTradingMethod();
                                trading.method = that;
                                trading.id = item.code;
                                trading.description = item.name;
                                trading.amount = item.amount;
                                trading.icon = item.picture;
                                trading.discount = item.discount;
                                if (ibas.strings.isEmpty(trading.icon)) {
                                    trading.icon = ibas.i18n.prop("receiptpayment_method_bp_asset_icon");
                                }
                                opRslt.resultObjects.add(trading);
                            }
                        }
                        if (caller.onCompleted instanceof Function) {
                            caller.onCompleted(opRslt);
                        }
                    }
                });
            }
        }

    }
}
