import driver from '../Database/dbconnection.js';

const deleteprofile = async (req, res) => {
    const session = driver.session();
    try {
        const checkUser = await session.run(
            'MATCH (u:User {id: $id}) RETURN u',
            { id: req.params.id }
        );

        if (checkUser.records.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        await session.run(
            'MATCH (u:User {id: $id}) DETACH DELETE u',
            { id: req.params.id }
        );

        res.status(200).json({ message: 'Profile Deleted Successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    } finally {
        await session.close();
    }
};

export default deleteprofile;
