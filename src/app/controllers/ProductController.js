import * as Yup from 'yup'
import Product from '../models/Product'
import Category from '../models/Category'
import User from '../models/User'

class ProductController {
    async store(request, response) {
        const schema = Yup.object({
            name: Yup.string().required(),
            price: Yup.number().required(),
            category_id: Yup.number().required(),
            offer: Yup.boolean(),
            desc: Yup.string(),
            type: Yup.string(),
            info1: Yup.string(),
            info2: Yup.string(),
            info3: Yup.string(),
            info4: Yup.string(),
            stock: Yup.number(),
        })

        try {
            schema.validateSync(request.body, { abortEarly: false })
        } catch (err) {
            return response.status(400).json({ error: err.errors })
        }

        const { admin: isAdmin } = await User.findByPk(request.userId)

        if (!isAdmin) {
            return response.status(401).json()
        }

        const { filename: path } = request.file
        const { name, price, category_id, offer, desc, type, info1, info2, info3, info4, stock } = request.body

        const product = await Product.create({
            name,
            price,
            category_id,
            desc,
            type,
            info1,
            info2,
            info3,
            info4,
            path,
            offer,
            stock,
        })

        return response.status(201).json(product)
    }

    async update(request, response) {
        const schema = Yup.object({
            name: Yup.string(),
            price: Yup.number(),
            category_id: Yup.number(),
            offer: Yup.boolean(),
            desc: Yup.string(),
            type: Yup.string(),
            info1: Yup.string(),
            info2: Yup.string(),
            info3: Yup.string(),
            info4: Yup.string(),
            stock: Yup.number(),
        })

        try {
            schema.validateSync(request.body, { abortEarly: false })
        } catch (err) {
            return response.status(400).json({ error: err.errors })
        }

        const { admin: isAdmin } = await User.findByPk(request.userId)

        if (!isAdmin) {
            return response.status(401).json()
        }

        const { id } = request.params

        const findProduct = await Product.findByPk(id)

        if (!findProduct) {
            return response.status(400).json({ error: 'Make sure your product ID is correct' })
        }

        let path
        if (request.file) {
            path = request.file.filename
        }

        const { name, price, category_id, offer, desc, type, info1, info2, info3, info4, stock } = request.body

        await Product.update(
            {
                name,
                price,
                category_id,
                desc,
                type,
                info1,
                info2,
                info3,
                info4,
                path,
                offer,
                stock,
            },
            {
                where: {
                    id,
                },
            }
        )

        return response.status(200).json()
    }

    async index(request, response) {
        const products = await Product.findAll({
            include: [
                {
                    model: Category,
                    as: 'category',
                    attributes: ['id', 'name'],
                },
            ],
        })

        return response.json(products)
    }

    async updateStock(request, response) {
        const schema = Yup.object({
            products: Yup.array().of(
                Yup.object({
                    id: Yup.number().required(),
                    quantity: Yup.number().required().min(1),
                })
            ).required(),
        })

        try {
            schema.validateSync(request.body, { abortEarly: false })
        } catch (err) {
            return response.status(400).json({ error: err.errors })
        }

        try {
            const { products } = request.body

            for (const { id, quantity } of products) {
                const product = await Product.findByPk(id)

                if (!product) {
                    return response.status(404).json({ error: `Produto com ID ${id} não encontrado.` })
                }

                if (product.stock < quantity) {
                    return response.status(400).json({ error: `Estoque insuficiente para o produto ${id}.` })
                }

                product.stock -= quantity
                await product.save()
            }

            return response.status(200).json({ message: 'Estoque atualizado com sucesso.' })
        } catch (error) {
            console.error(error)
            return response.status(500).json({ error: 'Erro ao atualizar estoque.' })
        }
    }
}

export default new ProductController()
