/**
 * @license
 * Copyright Color-Coding Studio. All Rights Reserved.
 *
 * Use of this source code is governed by an Apache License, Version 2.0
 * that can be found in the LICENSE file at http://www.apache.org/licenses/LICENSE-2.0
 */

namespace receiptpayment {
    export namespace app {
        /** 交易方式-现金 */
        export const TRADING_MODE_CASH: string = "TM_CASH";
        /**
         * 收款方式-现金
         */
        export class ReceiptMethodCash extends ReceiptMethod {
            constructor() {
                super();
                this.id = "9cf6da37-146e-408c-85a3-5f03d454a289";
                this.name = TRADING_MODE_CASH;
                this.description = ibas.i18n.prop("receiptpayment_method_cash");
                this.enabled = !ibas.config.get(ibas.strings.format(CONFIG_ITEM_TEMPLATE_TRADING_MODE_DISABLED, this.name), false);
                this.noTrade = true;
            }
            /** 获取可用交易类型 */
            getTradings(caller: IReceiptTradingGetter): void {
                if (caller.onCompleted instanceof Function) {
                    let opRslt: ibas.IOperationResult<ReceiptTradingMethod> = new ibas.OperationResult<ReceiptTradingMethod>();
                    let trading: ReceiptTradingMethod = new ReceiptTradingMethod();
                    trading.method = this;
                    trading.id = "";
                    trading.description = this.description;
                    trading.icon = ibas.i18n.prop("receiptpayment_method_cash_icon");
                    opRslt.resultObjects.add(trading);
                    caller.onCompleted(opRslt);
                }
            }
        }
        /**
         * 付款方式-现金
         */
        export class PaymentMethodCash extends PaymentMethod {
            constructor() {
                super();
                this.id = "87cfa94a-cc7e-4399-bfa7-ce055b38f65a";
                this.name = TRADING_MODE_CASH;
                this.description = ibas.i18n.prop("receiptpayment_method_cash");
                this.enabled = !ibas.config.get(ibas.strings.format(CONFIG_ITEM_TEMPLATE_TRADING_MODE_DISABLED, this.name), false);
                this.noTrade = true;
            }
            /** 获取可用交易类型 */
            getTradings(caller: IPaymentTradingGetter): void {
                if (caller.onCompleted instanceof Function) {
                    let opRslt: ibas.IOperationResult<PaymentTradingMethod> = new ibas.OperationResult<PaymentTradingMethod>();
                    let trading: IPaymentTradingMethod = new PaymentTradingMethod();
                    trading.method = this;
                    trading.id = "";
                    trading.description = this.description;
                    trading.icon = ibas.i18n.prop("receiptpayment_method_cash_icon");
                    opRslt.resultObjects.add(trading);
                    caller.onCompleted(opRslt);
                }
            }
        }
    }
}
