import driver from '../Database/dbconnection.js';

const usersignup = async (req, res) => {
    const session = driver.session();
    try {
        const { name, email, password } = req.body;

        const checkUser = await session.run(
            'MATCH (u:User {email: $email}) RETURN u',
            { email }
        );

        if (checkUser.records.length > 0) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const bcrypt = await import('bcryptjs');
        const hashPassword = await bcrypt.default.hash(password, 10);
        
        // Generate unique ID
        const id = Date.now().toString();

        const createUser = await session.run(
            `CREATE (u:User {
                id: $id,
                name: $name,
                email: $email,
                password: $password,
                image: $image,
                gender: $gender,
                address: $address,
                dob: $dob,
                phone: $phone,
                role: $role,
                books: $books
            }) RETURN u`,
            {
                id,
                name,
                email,
                password: hashPassword,
                image: req.body.image || "https://img.freepik.com/free-psd/3d-illustration-person-with-sunglasses_23-2149436188.jpg",
                gender: req.body.gender || "Male",
                address: req.body.address || "India",
                dob: req.body.dob || "01-01-2000",
                phone: req.body.phone || "1234567890",
                role: req.body.role || "Book Reader",
                books: req.body.books || "0"
            }
        );

        const userNode = createUser.records[0].get('u').properties;

        res.status(201).json({
            message: 'User created successfully',
            user: {
                id: userNode.id,
                name: userNode.name,
                email: userNode.email,
                image: userNode.image,
                gender: userNode.gender,
                address: userNode.address,
                dob: userNode.dob,
                phone: userNode.phone,
                role: userNode.role,
                books: userNode.books
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    } finally {
        await session.close();
    }
};

export default usersignup;
