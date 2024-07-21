import React, { useState, useEffect } from 'react';
import { Card, Button, Row, Col } from 'react-bootstrap';
import HeaderClient from '../HeaderClient/HeaderClient';
import Navbar from '../../Navbar/Navbar';
import Cart from '../Cart/Cart';
import Swal from 'sweetalert2'; 
import { useCart } from '../../../services/CartContext';
import Footer from '../../Footer/footer';

const HomeClient = () => {
    const [products, setProducts] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [cart, setCart] = useState([]);
    const [purchases, setPurchases] = useState([]);

    const { addToCart: addToCartContext } = useCart(); // Usa el hook del carrito

    useEffect(() => {
        fetchProducts()
            .then(data => setProducts(data))
            .catch(error => console.error('Error fetching products:', error));

        fetchPurchases();
    }, []);

    const fetchProducts = async () => {
        const response = await fetch('http://localhost:8000/products');
        if (!response.ok) {
            throw new Error('Failed to fetch products');
        }
        return await response.json();
    };

    const fetchPurchases = async () => {
        try {
            const response = await fetch('http://localhost:8000/purchases');
            if (!response.ok) {
                throw new Error('Failed to fetch purchases');
            }
            const data = await response.json();
            setPurchases(data);
        } catch (error) {
            console.error('Error fetching purchases:', error);
        }
    };

    const addToCart = (product) => {
        setCart([...cart, { ...product }]);
        addToCartContext(product); // Si usas un contexto para añadir al carrito
    };

    const removeFromCart = (productId) => {
        setCart(cart.filter(item => item.id !== productId));
    };

    const clearCart = () => {
        setCart([]);
    };

    const finalizePurchase = async () => {
        try {
            const response = await fetch('http://localhost:8000/purchases', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    items: cart,
                    total: cart.reduce((acc, product) => acc + product.price, 0),
                }),
            });
            if (!response.ok) {
                throw new Error('Failed to finalize purchase');
            }
            clearCart();
            Swal.fire({
                icon: 'success',
                title: 'Compra finalizada con éxito',
                confirmButtonText: 'Aceptar',
            });
            fetchPurchases();
        } catch (error) {
            console.error('Error finalizing purchase:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo finalizar la compra',
            });
        }
    };

    const handleCategorySelect = (category) => {
        setSelectedCategory(category);
    };

    const filteredProducts = selectedCategory
        ? products.filter(product => product.category === selectedCategory)
        : products;

    const handleAddToCart = (product) => {
        addToCart(product);
        Swal.fire({
            icon: 'success',
            title: 'Producto Añadido',
            text: `${product.name} ha sido añadido al carrito.`,
            confirmButtonText: 'Aceptar'
        });
    };

    return (
        <>
            <HeaderClient />
            <div className="home-container">
                    <Navbar onSelectCategory={handleCategorySelect} showNewCategoryButton={false} />
                
                <div className="products-container">
                    <Card>
                        <Card.Body>
                            {filteredProducts.length > 0 ? (
                                <Row xs={1} md={2} lg={3} className="g-4 mt-4">
                                    {filteredProducts.map(product => (
                                        <Col key={product.id}>
                                            <Card className='card'>
                                                <Card.Img className='card-img' src={product.image} alt={product.name} />
                                                <Card.Body className='card-body'>
                                                    <Card.Title>{product.name}</Card.Title>
                                                    <Card.Text>Precio: ${product.price}</Card.Text>
                                                    <Button className="add-product-cart-btn" variant="success" onClick={() => handleAddToCart(product)}>
                                                        Agregar al Carrito
                                                    </Button>
                                                </Card.Body>
                                            </Card>
                                        </Col>
                                    ))}
                                </Row>
                            ) : (
                                <p>No hay productos disponibles.</p>
                            )}
                        </Card.Body>
                    </Card>
                    
                </div>
               
            </div>
                <Footer />
        </>
    );
};

export default HomeClient;
