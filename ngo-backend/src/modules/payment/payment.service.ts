import { forwardRef, Inject, Injectable } from '@nestjs/common';
import Razorpay from 'razorpay';
import crypto from "crypto";
import { DonationRepository } from '../donation/donation.repository';


@Injectable()
export class PaymentService {

    constructor(
        private donationRepository: DonationRepository,
    ) { }



    async getInstance() {
        const instance = new Razorpay({
            key_id: process.env.RAZORPAY_API_KEY,
            key_secret: process.env.RAZORPAY_API_SECRET,
        })
        return instance;
    }

    async checkout(amount, reference) {
        console.log(reference)
        // console.log(typeof amount === typeof 100)
        let donation = await this.donationRepository.findOne({ where: { reference_payment: reference } })
        amount = String(amount) + "00";
        const options = {
            amount: parseInt(amount),
            currency: 'INR',
            // receipt: 'order_rcptid_11',
            // payment_capture: 1
        }
        const response = await (await this.getInstance()).orders.create(options);
        await this.donationRepository.update(donation.donation_id, { order_id: response.id })

        console.log(response)
        return { success: true, response };
    }

    async paymentVerification(body, res) {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;
        console.log(razorpay_order_id, razorpay_payment_id, razorpay_signature)
        // console.log(res)

        const newBody = razorpay_order_id + "|" + razorpay_payment_id;

        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_API_SECRET)
            .update(newBody.toString())
            .digest("hex");

        const isAuthentic = expectedSignature === razorpay_signature;

        if (isAuthentic) {
            // Database comes here
            const donation = await this.donationRepository.findOne({ where: { order_id: razorpay_order_id } })
            await this.donationRepository.update(donation.donation_id, {
                payment_order_id: razorpay_order_id,
                payment_status: "success",
                payment_signature: razorpay_signature,
                payment_id: razorpay_payment_id,
            })

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
