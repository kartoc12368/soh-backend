import { Injectable } from '@nestjs/common';
import Razorpay from 'razorpay';
import crypto from "crypto";


@Injectable()
export class PaymentService {

    async getInstance() {
        const instance = new Razorpay({
            key_id: process.env.RAZORPAY_API_KEY,
            key_secret: process.env.RAZORPAY_API_SECRET,
        })
        return instance;
    }

    async checkout(amount) {
        // console.log(typeof amount === typeof 100)
        amount = String(amount) + "00";
        const options = {
            amount: parseInt(amount),
            currency: 'INR',
            // receipt: 'order_rcptid_11',
            // payment_capture: 1
        }
        const response = await (await this.getInstance()).orders.create(options);
        console.log(response)
        return { success: true, response };
    }

    async paymentVerification(body, res) {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;
        console.log(body)
        console.log(res)

        const newBody = razorpay_order_id + "|" + razorpay_payment_id;

        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_API_SECRET)
            .update(body.toString())
            .digest("hex");

        const isAuthentic = expectedSignature === razorpay_signature;

        if (isAuthentic) {
            // Database comes here

            // await Payment.create({
            //     razorpay_order_id,
            //     razorpay_payment_id,
            //     razorpay_signature,
            // });

            res.redirect(
                `http://localhost:3000/paymentsuccess?reference=${razorpay_payment_id}`
            );
        } else {
            return { success: false }
        }

        return { success: true };
    }

    async getKey() {
        return { key: process.env.RAZORPAY_API_KEY }
    }


}
