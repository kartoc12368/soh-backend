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
    { header: 'Donor Name', key: 'donor_first_name' },
    { header: 'Donation Amount', key: 'amount' },
    { header: 'Payment Type', key: 'payment_type' },
    { header: 'Payment Status', key: 'payment_status' },
    { header: 'PAN', key: 'pan' },
    { header: 'Donor Email', key: 'donor_email' },
    { header: 'Donor Phone', key: 'donor_phone' },
    { header: 'Donor Address', key: 'donor_address' },
    { header: 'Donor City', key: 'donor_city' },
    { header: 'Donor State', key: 'donor_state' },
    { header: 'Donor Country', key: 'donor_country' },
    { header: 'Payment Reference', key: 'payment_id' },
  ];

  donations.forEach((value, idx) => {
    sheet.addRow({
      donation_id_frontend: value?.donation_id_frontend,
      donation_date: value?.donation_date,
      donor_first_name: value?.donor_first_name,
      amount: value?.amount,
      payment_type: value?.payment_type,
      payment_status: value?.payment_status,
      pan: value?.pan,
      donor_email: value?.donor_email,
      donor_phone: value?.donor_phone,
      donor_address: value?.donor_address,
      donor_city: value?.donor_city,
      donor_state: value?.donor_state,
      donor_country: value?.donor_country,
      payment_id: value?.payment_id,
    });
  });

  const downloadsFolder = path.join(__dirname, '../../../', 'downloads');

  if (!fs.existsSync(downloadsFolder)) {
    try {
      fs.mkdirSync(downloadsFolder);
    } catch (error) {
      console.error('Error creating downloads folder:', error);
    }
  }

  const filename = `${uuidv4()}.xlsx`;

  const filePath = path.join(downloadsFolder, filename);

  await workbook.xlsx.writeFile(filePath);
  return filename;
}
