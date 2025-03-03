import app from './app';
import 'dotenv/config';
import { MercadoPagoConfig, Preference } from 'mercadopago';

const client = new MercadoPagoConfig({ accessToken: process.env.ACCESS_TOKEN });
const preference = new Preference(client);

app.post('/create_preference', async (req, res) => {
    try {
        const { items, paymentMethod, deliveryTax } = req.body;

        const productSummary = items.map(item => `(x${item.quantity}) ${item.title}`).join(" | ");

        let discount = paymentMethod === "pix" ? 0.9 : 0;
        let totalPrice = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
        totalPrice = Number((totalPrice * (1 - discount)).toFixed(2));

        const consolidatedItem = [{
            title: productSummary,
            quantity: 1,
            unit_price: totalPrice + deliveryTax, // Adiciona o frete ao total
            currency_id: "BRL",
            description: "Compra contendo: " + productSummary
        }];

        const response = await preference.create({
            body: {
                items: consolidatedItem,
                back_urls: {
                    success: "http://localhost:5173/?status=success",
                    failure: "http://localhost:5173/falha",
                    pending: "http://localhost:5173/pendente"
                },
                auto_return: "approved"
            }
        });

        res.json({ id: response.id });

    } catch (error) {
        console.error('Erro ao criar preferência:', error);
        res.status(500).json({ error: 'Erro ao criar preferência' });
    }
});

app.listen(3001, () => console.log('Server is running at port 3001...'));
