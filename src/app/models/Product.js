import Sequelize, { Model } from 'sequelize'

class Product extends Model {
    static init(sequelize) {
        super.init(
            {
                name: Sequelize.STRING,
                price: Sequelize.INTEGER,
                desc: Sequelize.STRING,
                type: Sequelize.STRING,
                info1: Sequelize.STRING,
                info2: Sequelize.STRING,
                info3: Sequelize.STRING,
                info4: Sequelize.STRING,
                path: Sequelize.STRING,
                offer: Sequelize.BOOLEAN,
                stock: Sequelize.INTEGER,
                url: {
                    type: Sequelize.VIRTUAL,
                    get() {
                        return `http://localhost:3001/product-file/${this.path}`
                    },
                },
            },
            {
                sequelize,
            },
        )

        return this
    }

    static associate(models) {
        this.belongsTo(models.Category, {
            foreignKey: 'category_id',
            as: 'category',
        })
    }
}

export default Product