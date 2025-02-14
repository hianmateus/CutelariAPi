import app from './app'
import 'dotenv/config';
import { MercadoPagoConfig, Preference } from 'mercadopago';

const client = new MercadoPagoConfig({ accessToken: process.env.ACCESS_TOKEN });
const preference = new Preference(client);

app.get('/check_payment/:paymentId', async (req, res) => {
    try {
        const { paymentId } = req.params;
        const response = await payment.get({ id: paymentId });

        res.json({ status: response.status });
    } catch (error) {
        console.error('❌ Erro ao consultar pagamento:', error);
        res.status(500).json({ error: 'Erro ao consultar pagamento' });
    }
});

app.post('/create_preference', async (req, res) => {
    try {
        const { items, paymentMethod } = req.body;

        // Criar um título consolidado com nome e quantidade dos produtos
        const productSummary = items.map(item => `(x${item.quantity}) ${item.title}`).join(" | ");

        // Calcular o total com desconto (se aplicável)
        let discount = paymentMethod === "pix" ? 0.9 : 0;
        let totalPrice = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
        totalPrice = Number((totalPrice * (1 - discount)).toFixed(2)); // Aplica o desconto

        // Criar um único item consolidado para exibição correta no Mercado Pago
        const consolidatedItem = [{
            title: productSummary, // Aqui vai o nome de TODOS os produtos
            quantity: 1, // Mantemos como 1 para evitar múltiplas listagens erradas
            unit_price: totalPrice, // Total calculado
            currency_id: "BRL",
            description: "Compra contendo: " + productSummary // Detalhes adicionais
        }];

        const response = await preference.create({
            body: {
                items: consolidatedItem, // Agora enviamos apenas 1 item consolidado
                back_urls: {
                    success: "http://localhost:5173/",
                    failure: "http://localhost:5173/falha",
                    pending: "http://localhost:5173/pendente"
                },
                auto_return: "approved",
                payment_methods: {
                    excluded_payment_types: paymentMethod === "pix" ? [{ id: "credit_card" }, { id: "debit_card" }] : []
                }
            }
        });

        console.log('Preference created:', response);
        res.json({ id: response.id });

    } catch (error) {
        console.error('Erro ao criar preferência:', error);
        res.status(500).json({ error: 'Erro ao criar preferência' });
    }
});


app.listen(3001, () => console.log('Server is running at port 3001...'));
