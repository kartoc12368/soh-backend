import { Injectable } from '@nestjs/common';
import crypto from "crypto";
import Razorpay from 'razorpay';
import { DonationRepository } from '../donation/donation.repository';
import { DonationService } from '../donation/donation.service';


@Injectable()
export class PaymentService {

    constructor(
        private donationRepository: DonationRepository,

        private donationService: DonationService
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

    async paymentVerification(body, res, query) {
        const { id } = query;

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
            const donation = await this.donationRepository.findOne({ where: { order_id: razorpay_order_id }, relations: ["fundraiser"] })

            await this.donationRepository.update(donation.donation_id, {
                payment_order_id: razorpay_order_id,
                payment_status: "success",
                payment_signature: razorpay_signature,
                payment_id: razorpay_payment_id,
            })

            res.redirect(
                `http://localhost:3000/paymentsuccess/${id}/?reference=${razorpay_payment_id}`
            );
            console.log("helloe");
            const saveDonation = await this.donationService.saveDonation(donation);

        } else {
            return { success: false }
        }

        return { success: true };
    }

    async getKey() {
        return { key: process.env.RAZORPAY_API_KEY }
    }


}
