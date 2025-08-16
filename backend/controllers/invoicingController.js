// backend/controllers/invoicingController.js
const db = require('../db');
const puppeteer = require('puppeteer');
const { createJournalEntry } = require('../services/accountingService');

// --- HELPER FUNCTIONS FOR PDF TEMPLATES ---
function generateRoyalCanHTML(invoice, items) {
    let billedTo = invoice.company_name;
    const clientTypeLC = invoice.client_type.toLowerCase();
    if (clientTypeLC.includes('royal can rs')) { billedTo = 'Royal Can Company (Sulaymaniyeh)'; } 
    else if (clientTypeLC.includes('royal can rb')) { billedTo = 'Middle East Manufacturiung Packing Materiels CO.'; }
    return `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>body{font-family:Helvetica,Arial,sans-serif;font-size:10px;color:#333}.invoice-box{max-width:800px;margin:auto;padding:30px;border:1px solid #eee;box-shadow:0 0 10px rgba(0,0,0,.15)}.header{text-align:center;margin-bottom:20px}.header h2{font-size:28px;font-weight:bold;color:#2e4053}.header p{font-size:12px;color:#777}.invoice-details{display:flex;justify-content:space-between;margin-bottom:40px;font-size:12px}.invoice-table{width:100%;line-height:inherit;text-align:left;border-collapse:collapse}.invoice-table td{padding:8px;vertical-align:top}.invoice-table tr.heading td{background:#2e4053;color:#fff;border:1px solid #2e4053;font-weight:700;text-align:center;padding:8px;}.invoice-table tr.item td{border-bottom:1px solid #eee;text-align:center}.totals{margin-top:30px;text-align:right;font-size:12px}.totals table{display:inline-block;min-width:250px}.totals td{padding:5px 10px;text-align:right}.totals tr.total td{border-top:2px solid #333;font-weight:700;padding-top:10px}.footer{text-align:center;margin-top:40px;font-size:10px;color:#888}</style></head><body><div class="invoice-box"><div class="header"><h2>shadow</h2><p>Packaging Solutions & Design Services</p></div><div class="invoice-details"><div><strong>Billed To:</strong><br>${billedTo}</div><div style="text-align:right"><strong>Invoice #:</strong> ${invoice.invoice_number}<br><strong>Date:</strong> ${new Date(invoice.invoice_date).toLocaleDateString()}</div></div><table class="invoice-table"><thead><tr class="heading"><td>Company</td><td>Product</td><td>Code</td><td>Design Cost</td><td>Separation Cost</td><td>Total Cost</td></tr></thead><tbody>${items.map(item => `<tr class="item"><td>${item.end_customer_name||""}</td><td style="text-align:left">${item.product_description}</td><td>${item.code}</td><td style="text-align:right">$${parseFloat(String(item.design_cost_usd||0)).toFixed(2)}</td><td style="text-align:right">${parseFloat(String(item.separation_cost_iqd||0)).toLocaleString()} IQD</td><td style="text-align:right">${parseFloat(String(item.total_cost_iqd||0)).toLocaleString()} IQD</td></tr>`).join('')}</tbody></table><div class="totals"><table><tr><td>Subtotal:</td><td>${parseFloat(String(invoice.subtotal)).toLocaleString()} ${invoice.currency}</td></tr><tr class="total"><td>Total:</td><td>${parseFloat(String(invoice.total)).toLocaleString()} ${invoice.currency}</td></tr></table></div><div class="footer"><p>Make all checks payable to Shadow Company</p><p>P2, 15 Life Towers Complex | Erbil, 44001 | Finance@weshadow.com</p><p>Thank you for your business!</p></div></div></body></html>`;
}
function generateKarwanchiHTML(invoice, items) {
    return `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>body{font-family:Helvetica,Arial,sans-serif;font-size:10px;color:#333}.invoice-box{max-width:800px;margin:auto;padding:30px;border:1px solid #eee;box-shadow:0 0 10px rgba(0,0,0,.15)}.header{text-align:center;margin-bottom:20px}.header h2{font-size:28px;font-weight:bold;color:#2e4053}.header p{font-size:12px;color:#777}.invoice-details{display:flex;justify-content:space-between;margin-bottom:40px;font-size:12px}.invoice-table{width:100%;line-height:inherit;text-align:left;border-collapse:collapse}.invoice-table td{padding:8px;vertical-align:top}.invoice-table tr.heading td{background:#2e4053;color:#fff;border:1px solid #2e4053;font-weight:700;text-align:center;padding:8px;}.invoice-table tr.item td{border-bottom:1px solid #eee;text-align:center}.totals{margin-top:30px;text-align:right;font-size:12px}.totals table{display:inline-block;min-width:250px}.totals td{padding:5px 10px;text-align:right}.totals tr.total td{border-top:2px solid #333;font-weight:700;padding-top:10px}.footer{text-align:center;margin-top:40px;font-size:10px;color:#888}</style></head><body><div class="invoice-box"><div class="header"><h2>shadow</h2><p>Packaging Solutions & Design Services</p></div><div class="invoice-details"><div><strong>Billed To:</strong><br>Karwanchi Company</div><div style="text-align:right"><strong>Invoice #:</strong> ${invoice.invoice_number}<br><strong>Date:</strong> ${new Date(invoice.invoice_date).toLocaleDateString()}</div></div><table class="invoice-table"><thead><tr class="heading"><td>Product</td><td>Code</td><td>Size</td><td>Design Cost</td><td>Separation Cost</td><td>Total Cost</td></tr></thead><tbody>${items.map(item => `<tr class="item"><td style="text-align:left">${item.product_description}</td><td>${item.code}</td><td>${item.size||""}</td><td style="text-align:right">$${parseFloat(String(item.design_cost_usd||0)).toFixed(2)}</td><td style="text-align:right">$${parseFloat(String(item.separation_cost_usd||0)).toFixed(2)}</td><td style="text-align:right">$${(parseFloat(String(item.design_cost_usd||0))+parseFloat(String(item.separation_cost_usd||0))).toFixed(2)}</td></tr>`).join('')}</tbody></table><div class="totals"><table><tr><td>Subtotal:</td><td>$${parseFloat(String(invoice.subtotal)).toFixed(2)}</td></tr><tr class="total"><td>Total:</td><td>$${parseFloat(String(invoice.total)).toFixed(2)}</td></tr></table></div><div class="footer"><p>Make all checks payable to Shadow Company</p><p>P2, 15 Life Towers Complex | Erbil, 44001 | Finance@weshadow.com</p><p>Thank you for your business!</p></div></div></body></html>`;
}
function generateNormalHTML(invoice, items, exchangeRate) {
    const totalInIqd = parseFloat(String(invoice.total)) * exchangeRate;
    return `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>body{font-family:Helvetica,Arial,sans-serif;font-size:10px;color:#333}.invoice-box{max-width:800px;margin:auto;padding:30px;border:1px solid #eee;box-shadow:0 0 10px rgba(0,0,0,.15)}.header{text-align:center;margin-bottom:20px}.header h2{font-size:28px;font-weight:bold;color:#2e4053}.header p{font-size:12px;color:#777}.invoice-details{display:flex;justify-content:space-between;margin-bottom:40px;font-size:12px}.invoice-table{width:100%;line-height:inherit;text-align:left;border-collapse:collapse}.invoice-table td{padding:8px;vertical-align:top}.invoice-table tr.heading td{background:#2e4053;color:#fff;border:1px solid #2e4053;font-weight:700;text-align:center;padding:8px;}.invoice-table tr.item td{border-bottom:1px solid #eee}.totals{margin-top:30px;text-align:right;font-size:12px}.totals table{display:inline-block;min-width:250px}.totals td{padding:5px 10px;text-align:right}.totals tr.total td{border-top:2px solid #333;font-weight:700;padding-top:10px}.footer{text-align:center;margin-top:40px;font-size:10px;color:#888}</style></head><body><div class="invoice-box"><div class="header"><h2>shadow</h2><p>Packaging Solutions & Design Services</p></div><div class="invoice-details"><div><strong>Billed To:</strong><br>${invoice.company_name}</div><div style="text-align:right"><strong>Invoice #:</strong> ${invoice.invoice_number}<br><strong>Date:</strong> ${new Date(invoice.invoice_date).toLocaleDateString()}</div></div><table class="invoice-table"><thead><tr class="heading"><td style="text-align:right">Product</td><td style="text-align:right; font-family: 'Times New Roman', Times, serif;">المستج</td><td>Cost</td></tr></thead><tbody>${items.map(item => `<tr class="item"><td style="text-align:right">${item.product_description}</td><td style="text-align:right; font-family: 'Times New Roman', Times, serif;">${item.product_description_ar||""}</td><td style="text-align:left">$${parseFloat(String(item.design_cost_usd||0)).toFixed(2)}</td></tr>`).join('')}</tbody></table><div class="totals"><table><tr><td>Subtotal:</td><td style="text-align:left">$${parseFloat(String(invoice.subtotal)).toFixed(2)}</td></tr><tr><td>Discount:</td><td style="text-align:left">$${parseFloat(String(invoice.discount || 0)).toFixed(2)}</td></tr><tr class="total"><td>Total (USD):</td><td style="text-align:left">$${parseFloat(String(invoice.total)).toFixed(2)}</td></tr><tr class="total"><td>Total (IQD):</td><td style="text-align:left">${totalInIqd.toLocaleString()} IQD</td></tr></table></div><div class="footer"><p>Make all checks payable to Shadow Company</p><p>P2, 15 Life Towers Complex | Erbil, 44001 | Finance@weshadow.com</p><p>Thank you for your business!</p></div></div></body></html>`;
}
function generateZainGroupHTML(invoice, items) {
    return `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>body{font-family:Helvetica,Arial,sans-serif;font-size:10px;color:#333}.invoice-box{max-width:800px;margin:auto;padding:30px;border:1px solid #eee;box-shadow:0 0 10px rgba(0,0,0,.15)}.header{text-align:center;margin-bottom:20px}.header h2{font-size:28px;font-weight:bold;color:#2e4053}.header p{font-size:12px;color:#777}.invoice-details{display:flex;justify-content:space-between;margin-bottom:40px;font-size:12px}.invoice-table{width:100%;line-height:inherit;text-align:left;border-collapse:collapse}.invoice-table td{padding:8px;vertical-align:top}.invoice-table tr.heading td{background:#2e4053;color:#fff;border:1px solid #2e4053;font-weight:700;text-align:center;padding:8px;}.invoice-table tr.item td{border-bottom:1px solid #eee;text-align:center}.totals{margin-top:30px;text-align:right;font-size:12px}.totals table{display:inline-block;min-width:250px}.totals td{padding:5px 10px;text-align:right}.totals tr.total td{border-top:2px solid #333;font-weight:700;padding-top:10px}.footer{text-align:center;margin-top:40px;font-size:10px;color:#888}</style></head><body><div class="invoice-box"><div class="header"><h2>shadow</h2><p>Packaging Solutions & Design Services</p></div><div class="invoice-details"><div><strong>Billed To:</strong><br>${invoice.company_name}</div><div style="text-align:right"><strong>Invoice #:</strong> ${invoice.invoice_number}<br><strong>Date:</strong> ${new Date(invoice.invoice_date).toLocaleDateString()}</div></div><table class="invoice-table"><thead><tr class="heading"><td>Product</td><td>Code</td><td>Size</td><td>Design Cost</td><td>Separation Cost</td><td>Total Cost</td></tr></thead><tbody>${items.map(item => `<tr class="item"><td style="text-align:left">${item.product_description}</td><td>${item.code}</td><td>${item.size||""}</td><td style="text-align:right">$${parseFloat(String(item.design_cost_usd||0)).toFixed(2)}</td><td style="text-align:right">$${parseFloat(String(item.separation_cost_usd||0)).toFixed(2)}</td><td style="text-align:right">$${(parseFloat(String(item.design_cost_usd||0))+parseFloat(String(item.separation_cost_usd||0))).toFixed(2)}</td></tr>`).join('')}</tbody></table><div class="totals"><table><tr><td>Subtotal:</td><td>$${parseFloat(String(invoice.subtotal)).toFixed(2)}</td></tr><tr class="total"><td>Total:</td><td>$${parseFloat(String(invoice.total)).toFixed(2)}</td></tr></table></div><div class="footer"><p>Make all checks payable to Shadow Company</p><p>P2, 15 Life Towers Complex | Erbil, 44001 | Finance@weshadow.com</p><p>Thank you for your business!</p></div></div></body></html>`;
}


// --- CONTROLLER EXPORTS ---

exports.generateInvoices = async (req, res) => {
    const { currency } = req.query; // Get currency from the request
    try {
        const query = db('orders')
            .join('clients', 'orders.client_id', '=', 'clients.id')
            .where({ is_approved: true, is_invoiced: false })
            .select('orders.*', 'clients.client_type', 'clients.primary_currency');

        // --- NEW: Filter eligible orders by currency ---
        if (currency) {
            query.where('clients.primary_currency', currency);
        }

        const eligibleOrders = await query;
        if (eligibleOrders.length === 0) {
            return res.status(200).json({ message: 'No approved orders to invoice.' });
        }
        
        const groupedOrders = {};
        for (const order of eligibleOrders) {
            const key = order.billing_branch ? `client_${order.client_id}_${order.billing_branch}` : `client_${order.client_id}`;
            if (!groupedOrders[key]) {
                groupedOrders[key] = { client_id: order.client_id, client_type: order.client_type, orders: [] };
            }
            groupedOrders[key].orders.push(order);
        }

        let invoicesCreatedCount = 0;
        for (const groupKey in groupedOrders) {
            const { client_id, client_type, orders } = groupedOrders[groupKey];
            await db.transaction(async (trx) => {
                let subtotal = 0;
                let invoiceCurrency = 'USD';
                const clientTypeLC = client_type.toLowerCase();
                
                if (clientTypeLC.includes('royal can') || clientTypeLC.includes('karwanchi')) {
                    invoiceCurrency = 'IQD';
                    subtotal = orders.reduce((sum, order) => sum + (parseFloat(order.total_cost_iqd) || 0), 0);
                } else if (clientTypeLC.includes('zain group')) {
                    invoiceCurrency = 'USD';
                    subtotal = orders.reduce((sum, order) => sum + (parseFloat(order.design_cost_usd) || 0) + (parseFloat(order.separation_cost_usd) || 0), 0);
                } else {
                    invoiceCurrency = 'USD';
                    subtotal = orders.reduce((sum, order) => sum + (parseFloat(order.design_cost_usd) || 0), 0);
                }
                
                const lastInvoice = await trx('invoices').orderBy('id', 'desc').first();
                const nextInvoiceNumber = lastInvoice ? parseInt(lastInvoice.invoice_number) + 1 : 731;
                const [newInvoice] = await trx('invoices').insert({ client_id, invoice_number: nextInvoiceNumber.toString(), invoice_date: new Date(), status: 'Draft', subtotal, total: subtotal, currency: invoiceCurrency }).returning('*');
                
                const invoiceItems = orders.map(order => ({
                    invoice_id: newInvoice.id,
                    order_id: order.id,
                    description: `${order.product_description} (Code: ${order.code})`,
                    line_total: order.total_cost_iqd || order.total_cost_usd || order.design_cost_usd || 0,
                }));
                await trx('invoice_items').insert(invoiceItems);
                
                const orderIds = orders.map(order => order.id);
                await trx('orders').whereIn('id', orderIds).update({ is_invoiced: true });
            });
            invoicesCreatedCount++;
        }
        res.status(201).json({ message: `Successfully generated ${invoicesCreatedCount} invoice(s).` });
    } catch (error) {
        console.error('Invoice generation failed:', error);
        res.status(500).json({ message: 'Server error during invoice generation.' });
    }
};

exports.getAllInvoices = async (req, res) => {
    const { currency } = req.query;
    try {
        const query = db('invoices')
            .join('clients', 'invoices.client_id', '=', 'clients.id')
            .select('invoices.id', 'invoices.invoice_number', 'invoices.invoice_date', 'invoices.total', 'invoices.status', 'invoices.currency', 'clients.company_name as client_name')
            .orderBy('invoices.invoice_date', 'desc');

        // --- NEW: Filter by currency ---
        if (currency) {
            query.where('clients.primary_currency', currency);
        }
        
        const invoices = await query;
        res.status(200).json(invoices);
    } catch (error) {
        console.error('Failed to fetch invoices:', error);
        res.status(500).json({ message: 'Server error fetching invoices.' });
    }
};

exports.getSingleInvoice = async (req, res) => {
    const { id } = req.params;
    try {
        const invoice = await db('invoices').join('clients', 'invoices.client_id', '=', 'clients.id').select('invoices.*', 'clients.company_name', 'clients.client_type').where({ 'invoices.id': id }).first();
        if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
        const items = await db('invoice_items').where({ invoice_id: id });
        res.status(200).json({ ...invoice, items });
    } catch (error) {
        console.error('Error fetching invoice details:', error);
        res.status(500).json({ message: 'Server error fetching invoice details.' });
    }
};

exports.updateInvoiceStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    if (!status) { return res.status(400).json({ message: 'Status is required.' }); }
    try {
        await db.transaction(async (trx) => {
            const invoiceToUpdate = await trx('invoices').where({id}).first();
            if (!invoiceToUpdate) { throw new Error('Invoice not found.'); }

            const [updatedInvoice] = await trx('invoices').where({ id }).update({ status }).returning('*');
            
            if (status === 'Paid' && invoiceToUpdate.status !== 'Paid') {
                const cashAccount = await trx('chart_of_accounts').where({ account_name: 'Cash' }).first();
                const revenueAccount = await trx('chart_of_accounts').where({ account_name: 'Sales & Service Revenue' }).first();
                if (!cashAccount || !revenueAccount) throw new Error('Core accounting accounts not found.');
                const entryData = {
                    entry_date: new Date(),
                    description: `Payment for Invoice #${updatedInvoice.invoice_number}`,
                    lines: [
                        { account_id: cashAccount.id, debit: updatedInvoice.total, credit: null },
                        { account_id: revenueAccount.id, debit: null, credit: updatedInvoice.total }
                    ]
                };
                await createJournalEntry(entryData, trx);
            }

            const finalInvoice = await trx('invoices').join('clients', 'invoices.client_id', '=', 'clients.id').select('invoices.*', 'clients.company_name as client_name').where({ 'invoices.id': updatedInvoice.id }).first();
            res.status(200).json(finalInvoice);
        });
    } catch (error) {
        console.error('Error updating invoice status:', error);
        res.status(500).json({ message: 'Server error updating invoice status.' });
    }
};

exports.downloadInvoicePdf = async (req, res) => {
    const { id } = req.params;
    try {
        const invoice = await db('invoices').join('clients', 'invoices.client_id', '=', 'clients.id').select('invoices.*', 'clients.company_name', 'clients.client_type').where({ 'invoices.id': id }).first();
        if (!invoice) { return res.status(404).json({ message: 'Invoice not found' }); }
        const items = await db('invoice_items').join('orders', 'invoice_items.order_id', '=', 'orders.id').select('orders.*').where({ 'invoice_items.invoice_id': id });
        
        const clientType = invoice.client_type.toLowerCase();
        let htmlContent = '';

        if (clientType.includes('royal can')) {
            htmlContent = generateRoyalCanHTML(invoice, items);
        } else if (clientType.includes('karwanchi')) {
            htmlContent = generateKarwanchiHTML(invoice, items);
        } else if (clientType.includes('zain group')) {
            htmlContent = generateZainGroupHTML(invoice, items);
        } else {
            const setting = await db('settings').where({ setting_key: 'NORMAL_CLIENT_EXCHANGE_RATE' }).first();
            const exchangeRate = setting ? parseFloat(setting.setting_value) : 1450;
            htmlContent = generateNormalHTML(invoice, items, exchangeRate);
        }
        
        const browser = await puppeteer.launch({ headless: "new", args: ['--no-sandbox', '--disable-setuid-sandbox'] });
        const page = await browser.newPage();
        await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
        const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
        await browser.close();

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="invoice-${invoice.invoice_number}.pdf"`);
        res.send(pdfBuffer);
    } catch (error) {
        console.error('PDF generation failed:', error);
        res.status(500).json({ message: 'Failed to generate PDF.' });
    }
};