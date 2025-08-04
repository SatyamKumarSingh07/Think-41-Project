require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const app = express();
const port = process.env.PORT || 3000;

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Middleware
app.use(cors());
app.use(express.json());

// List all customers with pagination
app.get('/api/customers', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const start = (page - 1) * limit;
    
    const { data, error, count } = await supabase
      .from('users')
      .select('id, first_name, last_name, email, age, gender, state, city, country, created_at', { count: 'exact' })
      .range(start, start + limit - 1)
      .order('id', { ascending: true });

    if (error) {
      throw new Error(error.message);
    }

    res.status(200).json({
      success: true,
      data: data,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: limit
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Get specific customer details with order count
app.get('/api/customers/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Get customer details
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, first_name, last_name, email, age, gender, state, city, country, created_at')
      .eq('id', id)
      .single();

    if (userError) {
      throw new Error(userError.message);
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Customer not found',
        message: `Customer with ID ${id} not found`
      });
    }

    // Get order count
    const { count, error: countError } = await supabase
      .from('orders')
      .select('order_id', { count: 'exact' })
      .eq('user_id', id);

    if (countError) {
      throw new Error(countError.message);
    }

    res.status(200).json({
      success: true,
      data: {
        ...user,
        order_count: count
      }
    });
  } catch (error) {
    if (error.message.includes('not found')) {
      res.status(404).json({
        success: false,
        error: 'Customer not found',
        message: error.message
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: error.message
      });
    }
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: err.message
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});