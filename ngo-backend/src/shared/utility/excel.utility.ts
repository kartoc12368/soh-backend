import { Donation } from '../entity/donation.entity';
import * as exceljs from 'exceljs';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

export async function downloadDonationsExcel(donations: Donation[]) {
  const workbook = new exceljs.Workbook();

  const sheet = workbook?.addWorksheet('donations');

  sheet.columns = [
    { header: 'Donation Id', key: 'donation_id_frontend' },
    { header: 'Donation Date', key: 'donation_date' },
    { header: 'Donation Time', key: 'donation_time' },
    { header: 'Donor Name', key: 'donor_name' },
    { header: 'Amount', key: 'amount' },
    { header: 'Payment Type', key: 'payment_type' },
    { header: 'PAN', key: 'pan' },
    { header: 'Donor Email', key: 'donor_email' },
    { header: 'Donor Phone', key: 'donor_phone' },
    { header: 'Donor Address', key: 'donor_address' },
    { header: 'Payment Reference', key: 'payment_id' },
  ];

  donations.forEach((value, idx) => {
    const date = new Date(value?.created_at);

    sheet.addRow({
      donation_id_frontend: value?.donation_id_frontend,
      donation_date: value?.donation_date,
      donation_time: date.toTimeString().split(' ')[0],
      donor_name: value?.donor_first_name + ' ' + (value?.donor_last_name ?? ''),
      amount: value?.amount,
      payment_type: value?.payment_type,
      pan: value?.pan,
      donor_email: value?.donor_email,
      donor_phone: value?.donor_phone,
      donor_address: value?.donor_address,
      payment_id: value?.reference_payment,
    });
  });

  //   const downloadsFolder = path.join(__dirname, '../../../', 'downloads');

  //   if (!fs.existsSync(downloadsFolder)) {
  //     try {
  //       fs.mkdirSync(downloadsFolder);
  //     } catch (error) {
  //       console.error('Error creating downloads folder:', error);
  //     }
  //   }

  const filename = `${uuidv4()}.xlsx`;

  //   const filePath = path.join(downloadsFolder, filename);

  //   await workbook.xlsx.writeFile(filePath);
  const buffer = await workbook.xlsx.writeBuffer();
  await workbook.xlsx.load(buffer);

  return { filename: filename, content: buffer };
}
