﻿/**
 * @license
 * Copyright Color-Coding Studio. All Rights Reserved.
 *
 * Use of this source code is governed by an Apache License, Version 2.0
 * that can be found in the LICENSE file at http://www.apache.org/licenses/LICENSE-2.0
 */
namespace receiptpayment {
    /** 模块-标识 */
    export const CONSOLE_ID: string = "77d894db-e7f7-4fdd-910c-7835612407be";
    /** 模块-名称 */
    export const CONSOLE_NAME: string = "ReceiptPayment";
    /** 模块-版本 */
    export const CONSOLE_VERSION: string = "0.1.0";

    export namespace bo {
        /** 业务仓库名称 */
        export const BO_REPOSITORY_RECEIPTPAYMENT: string = ibas.strings.format(ibas.MODULE_REPOSITORY_NAME_TEMPLATE, CONSOLE_NAME);
        /** 业务对象编码-付款 */
        export const BO_CODE_PAYMENT: string = "${Company}_RP_PAYMENT";
        /** 业务对象编码-收款 */
        export const BO_CODE_RECEIPT: string = "${Company}_RP_RECEIPT";
        /** 业务对象编码-资产充值 */
        export const BO_CODE_ASSETRECHARGE: string = "${Company}_RP_ASRECHARGE";
    }

    export namespace app {
        /** 收款契约 */
        export interface IReceiptContract extends ibas.IServiceContract {
            /** 业务伙伴类型 */
            businessPartnerType: businesspartner.bo.emBusinessPartnerType;
            /** 业务伙伴编码 */
            businessPartnerCode: string;
            /** 单据类型 */
            documentType: string;
            /** 单据编号 */
            documentEntry: number;
            /** 单据行号 */
            documentLineId?: number;
            /** 单据行号 */
            documentTotal: number;
            /** 单据货币 */
            documentCurrency: string;
        }
        /** 收款服务代理 */
        export class ReceiptServiceProxy extends ibas.ServiceProxy<IReceiptContract> {

        }

        export namespace trading {
            /** 交易的调用者 */
            export interface ITradingCaller extends ibas.IMethodCaller<bo.IReceiptItem> {
                /** 金额 */
                amount: number;
                /** 货币 */
                currency: string;
                /** 交易识别码 */
                tradeId: string;
            }
            /** 交易方式 */
            export interface ITradingMethod {
                /** 组 */
                group: string;
                /** 标记 */
                id: string;
                /** 描述 */
                description: string;
                /** 图标 */
                icon?: string;
                /** 收款 */
                trading(caller: ITradingCaller): void;
            }
            /** 交易方式的调用者 */
            export interface ITradingMethodCaller extends ibas.IMethodCaller<ITradingMethod> {
                /** 业务伙伴类型 */
                businessPartnerType: businesspartner.bo.emBusinessPartnerType;
                /** 业务伙伴编码 */
                businessPartnerCode: string;
                /** 单据类型 */
                documentType: string;
                /** 单据编号 */
                documentEntry: number;
                /** 单据行号 */
                documentLineId?: number;
                /** 单据行号 */
                documentTotal: number;
                /** 单据货币 */
                documentCurrency: string;
            }
            /** 收款交易方式 */
            export interface IReceiptMethod {
                /** 名称 */
                name: string;
                /** 描述 */
                description: string;
                /** 获取可用交易类型 */
                getTrading(caller: ITradingMethodCaller): void;
            }
            /** 付款交易方式 */
            export interface IPaymentMethod {
                /** 名称 */
                name: string;
                /** 描述 */
                description: string;
                /** 获取可用交易类型 */
                getTrading(caller: ITradingMethodCaller): void;
            }
            /** 收款方式管理员 */
            export interface IReceiptMethodManager {
                /** 注册收款方式 */
                register(method: IReceiptMethod): void;
                /** 获取方式 */
                getMethods(): IReceiptMethod[];
            }
            /** 付款方式管理员 */
            export interface IPaymentMethodManager {
                /** 注册付款方式 */
                register(method: IPaymentMethod): void;
                /** 获取方式 */
                getMethods(): IPaymentMethod[];
            }
            /** 注册收款方式 */
            export function registerReceipt(method: IReceiptMethod): void {
                let module: any = receiptpayment;
                if (ibas.objects.isNull(module)) {
                    return;
                }
                let manager: IReceiptMethodManager = module.receiptMethodManager;
                if (ibas.objects.isNull(manager)) {
                    return;
                }
                if (manager.register instanceof Function) {
                    manager.register(method);
                }
            }
            /** 注册付款方式 */
            export function registerPayment(method: IPaymentMethod): void {
                let module: any = receiptpayment;
                if (ibas.objects.isNull(module)) {
                    return;
                }
                let manager: IPaymentMethodManager = module.paymentMethodManager;
                if (ibas.objects.isNull(manager)) {
                    return;
                }
                if (manager.register instanceof Function) {
                    manager.register(method);
                }
            }
        }
    }
}