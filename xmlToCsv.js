// const xml2csv = require('xml2csv');

// xml2csv({
// 	xmlPath: './nestbloom.wordpress.2018-08-30.xml',
//     csvPath: './output.csv',
//     rootXMLElement: 'item',
//     headerMap: [
//       ['title', 'Title', 'string'],
//       ['excerpt:encoded', 'Order Details', 'string'],

//     ]
// }, function (err, info) {
// 	console.log(err, info);
// });

const fs = require('fs');
	  xml2js = require('xml2js');
	  converter = require('json-2-csv');
	  csvWriter = require('csv-write-stream');
	  createCsvWriter = require('csv-writer').createObjectCsvWriter;

const writer = csvWriter();
const parser = new xml2js.Parser();
fs.readFile('./nestbloom.wordpress.2018-08-30.xml', function (err, data) {
	parser.parseString(data, function (err, result) {
		const orders = result.rss.channel[0].item;
		const ordersMapped = orders.map(order => {
			const metaData = order['wp:postmeta'];
			let customerFirstName;
			let customerLastName;
			let customerEmail;
			let orderNumber;
			let shippingAddressIndex;
			let orderTotal;
			if (metaData) {
				metaData.map(data => {
					switch(data['wp:meta_key'][0]) {
						case '_billing_first_name' :
							customerFirstName = data['wp:meta_value'][0];
							return;
						case '_billing_last_name':
							customerLastName = data['wp:meta_value'][0];
							return;
						case '_billing_email':
							customerEmail = data['wp:meta_value'][0];
							return;
						case '_alg_wc_custom_order_number':
							orderNumber = data['wp:meta_value'][0];
							return;
						case '_shipping_address_index':
							shippingAddressIndex = data['wp:meta_value'][0];
							return;
						case '_order_total':
							orderTotal = data['wp:meta_value'][0];
							return;
						default: 
							return;
					}
				});
			} 
			const customerName = `${customerFirstName} ${customerLastName}`;
			return {
				order_number: orderNumber || order['wp:post_id'][0],
				order_date: order['wp:post_date'][0],
				order_status: order['wp:status'][0],
				extra_message: order['excerpt:encoded'][0], 
				order_total: orderTotal,
				customer_name: customerName,
				customer_email: customerEmail,
				shipping_address_index: shippingAddressIndex
			}
		});
		// converter.json2csv(ordersMapped, (err, csv) => {
		// 	writer.pipe(fs.createWriteStream('./output.csv'))
		// 	writer.write(csv);
		// 	writer.end()
		// 	// fs.writeFile('./output.csv', csv, 'utf-8', err => {
		// 	// 	if (err) {
		// 	// 		console.log(err);
		// 	// 	}
		// 	// });
		// });
		const csvWriter = createCsvWriter({
			path: './output.csv', 
			header: [
				{id: 'order_number', title: 'Order Number'}, 
				{id: 'order_date', title: 'Order Date'}, 
				{id: 'order_status', title: 'Order Status'}, 
				{id: 'extra_message', title: 'Extra Message'}, 
				{id: 'order_total', title: 'Order Total'}, 
				{id: 'customer_name', title: 'Customer Name'}, 
				{id: 'customer_email', title: 'Customer Email'}, 
				{id: 'shipping_address_index', title: 'Shipping Address Index'}
			]
		});
		csvWriter.writeRecords(ordersMapped).then(_ => console.log('done'));
		console.log('done');
	});
});