require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

app.use(cors());
app.use(express.json());

app.get('/api/customers', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const start = (page - 1) * limit;
    const { data, error, count } = await supabase
      .from('users')
      .select('id, first_name, last_name, email, age, gender, state, city, country, created_at', { count: 'exact' })
      .range(start, start + limit - 1)
      .order('id', { ascending: true });

    if (error) throw error;

    res.status(200).json({
      success: true,
      data,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Internal server error', message: error.message });
  }
});

app.get('/api/customers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, first_name, last_name, email, age, gender, state, city, country, created_at')
      .eq('id', id)
      .single();

    if (userError || !user) {
      return res.status(404).json({ success: false, error: 'Customer not found', message: `Customer with ID ${id} not found` });
    }

    const { data: orders, error: countError } = await supabase
      .from('orders')
      .select('order_id, status, created_at, num_of_item')
      .eq('user_id', id);

    if (countError) throw new Error(countError.message);

    res.status(200).json({
      success: true,
      data: {
        ...user,
        order_count: orders.length
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Internal server error', message: error.message });
  }
});

app.get('/api/orders', async (req, res) => {
  try {
    const { user_id, page = 1, limit = 10 } = req.query;

    if (!user_id) {
      return res.status(400).json({ success: false, error: 'Bad request', message: 'user_id query parameter is required' });
    }

    const start = (page - 1) * limit;
    const { data: orders, error, count } = await supabase
      .from('orders')
      .select('order_id, user_id, status, created_at, num_of_item', { count: 'exact' })
      .eq('user_id', user_id)
      .range(start, start + limit - 1)
      .order('created_at', { ascending: false });

    if (error) throw error;

    if (!orders || orders.length === 0) {
      return res.status(404).json({ success: false, error: 'Orders not found', message: `No orders found for user_id ${user_id}` });
    }

    res.status(200).json({
      success: true,
      data: orders,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Internal server error', message: error.message });
  }
});

app.get('/api/orders/:order_id', async (req, res) => {
  try {
    const { order_id } = req.params;
    const { data: order, error } = await supabase
      .from('orders')
      .select('order_id, user_id, status, created_at, num_of_item')
      .eq('order_id', order_id)
      .single();

    if (error || !order) {
      return res.status(404).json({ success: false, error: 'Order not found', message: `Order with ID ${order_id} not found` });
    }

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Internal server error', message: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));