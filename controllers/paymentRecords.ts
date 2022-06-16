import { Request, Response, NextFunction, RequestHandler } from 'express';
import * as PaymentRecord from '../models/paymentRecord';
import IPaymentRecord from '../interfaces/IPaymentRecord';
import { ErrorHandler } from '../helpers/errors';
import { formatSortString } from '../helpers/functions';
import Joi from 'joi';


const validatePaymentRecord = (req: Request, res: Response, next: NextFunction) => {
    let required: Joi.PresenceMode = 'optional';
    if (req.method === 'POST') {
      required = 'required';
    }
    const errors = Joi.object({
        numberCheck: Joi.number().max(100).presence(required),
        isPaymentActiviy: Joi.bool().presence(required),
        datePay: Joi.date().max(100).presence(required),
        amoutPay: Joi.number().max(100).presence(required),
        idPaymentMethod: Joi.number().max(100).presence(required),
        idFamily: Joi.number().max(100).presence(required),
        idFamilyMember: Joi.number().max(100).presence(required),
        id: Joi.number().optional(), // pour react-admin
      }).validate(req.body, { abortEarly: false }).error;
      if (errors) {
        next(new ErrorHandler(422, errors.message));
      } else {
        next();
      }
    };

const getAllPaymentRecords = (async (
    req: Request,
    res: Response,
    next: NextFunction
    ) => {
    try {
        const sortBy: string = req.query.sort as string;
        const paymentRecords = await PaymentRecord.getAllPaymentRecord(formatSortString(sortBy));
    
        res.setHeader(
        'Content-Range',
        `users : 0-${paymentRecords.length}/${paymentRecords.length + 1}`
        );
        return res.status(200).json(paymentRecords);
    } catch (err) {
        next(err);
    }
    }) as RequestHandler;

const getOnePaymentRecordById = (async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { idPaymentRecord } = req.params;
        const paymentRecords = await PaymentRecord.getPaymentRecordById(Number(idPaymentRecord));
        paymentRecords ? res.status(200).json(paymentRecords) : res.sendStatus(404);
    } catch (err) {
        next(err);
    }
    }) as RequestHandler;

const addPaymentRecord = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const paymentRecord = req.body as IPaymentRecord;
        paymentRecord.id = await PaymentRecord.addPaymentRecord(paymentRecord);
        res.status(201).json(paymentRecord);
    } catch (err) {
        next(err);
    }
    };

const updatePaymentRecord = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { idPaymentRecord } = req.params;
        const paymentRecordUpdated = await PaymentRecord.updatePaymentRecord(
        Number(idPaymentRecord),
        req.body as IPaymentRecord
        );
        if (paymentRecordUpdated) {
        const paymentRecord = await PaymentRecord.getPaymentRecordById(Number(idPaymentRecord));
        res.status(200).send(paymentRecord); // react-admin needs this response
        } else {
        throw new ErrorHandler(500, `PaymentRecord cannot be updated`);
        }
    } catch (err) {
        next(err);
    }
    };

const deletePaymentRecord = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Récupèrer l'id user de req.params
        const { idPaymentRecord } = req.params;
        // Vérifier si le user existe
        const paymentRecord = await PaymentRecord.getPaymentRecordById(Number(idPaymentRecord));
        const paymentRecordDeleted = await PaymentRecord.deletePaymentRecord(Number(idPaymentRecord));
        if (paymentRecordDeleted) {
        res.status(200).send(paymentRecord); // react-admin needs this response
        } else {
        throw new ErrorHandler(500, `This paymentRecord cannot be deleted`);
        }
    } catch (err) {
        next(err);
    }
    };


    export {
        validatePaymentRecord,
        getAllPaymentRecords,
        getOnePaymentRecordById,
        addPaymentRecord,
        updatePaymentRecord,
        deletePaymentRecord
    };