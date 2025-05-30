import driver from '../Database/dbconnection.js'

const books = async (req, res) => {
    const session = driver.session()
    try {
        const result = await session.run('MATCH (b:Book) RETURN b')
        const books = result.records.map(record => record.get('b').properties)
        res.status(200).json(books)
    } catch (error) {
        res.status(500).json({ message: error.message })
    } finally {
        await session.close()
    }
}

export default books