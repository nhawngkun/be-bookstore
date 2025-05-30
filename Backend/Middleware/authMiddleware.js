import driver from '../Database/dbconnection.js';

// Middleware kiểm tra quyền admin
const authMiddleware = async (req, res, next) => {
  const session = driver.session();
  
  try {
    // Lấy token từ header
    const userId = req.headers.authorization;
    
    if (!userId) {
      return res.status(401).json({ message: 'Authorization required' });
    }
    
    // Kiểm tra user trong database
    const result = await session.run(
      'MATCH (u:User {id: $userId}) RETURN u',
      { userId }
    );
    
    if (result.records.length === 0) {
      return res.status(401).json({ message: 'User not found' });
    }
    
    const userRole = result.records[0].get('u').properties.role;
    
    // Kiểm tra role
    if (userRole.toLowerCase() !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin rights required' });
    }
    
    // Nếu là admin, cho phép tiếp tục
    next();
  } catch (error) {
    res.status(500).json({ message: error.message });
  } finally {
    await session.close();
  }
};

export default authMiddleware;
