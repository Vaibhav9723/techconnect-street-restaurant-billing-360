import { useState, useMemo } from 'react';
import { useProducts, useCategories, useBills, useSettings, useTokens } from '@/hooks/useEncryptedStorage';
import { Product, Category, BillItem, Bill } from '@shared/schema';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Plus, Minus, Trash2, X, ShoppingCart, Check, CreditCard, Banknote, Wallet } from 'lucide-react';
import { nanoid } from 'nanoid';
import { useToast } from '@/hooks/use-toast';
import { InvoiceModal } from '@/components/invoice-modal';
import { cn } from '@/lib/utils';

export default function Billing() {
  const { data: products, setData: setProducts } = useProducts();
  const { data: categories } = useCategories();
  const { data: bills, setData: setBills } = useBills();
  const { data: settings } = useSettings();
  const { data: tokens, setData: setTokens } = useTokens();
  const { toast } = useToast();

  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<BillItem[]>([]);
  const [discount, setDiscount] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showCart, setShowCart] = useState(false); // For mobile
  const [completedBill, setCompletedBill] = useState<Bill | null>(null);
  const [paymentMode, setPaymentMode] = useState<'cash' | 'online' | 'both'>('cash');
  const [onlineAmount, setOnlineAmount] = useState(0);

  const filteredProducts = useMemo(() => {
    return products.filter((p: Product) => {
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = !selectedCategory || p.categoryId === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, search, selectedCategory]);

  const getCategoryName = (categoryId: string) => {
    return categories.find((c: Category) => c.id === categoryId)?.name || 'Unknown';
  };

  const getCartQuantity = (productId: string) => {
    return cart.find(item => item.productId === productId)?.quantity || 0;
  };

  const addToCart = (product: Product) => {
    const existing = cart.find(item => item.productId === product.id);
    
    if (existing) {
      setCart(cart.map(item =>
        item.productId === product.id
          ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.price }
          : item
      ));
    } else {
      setCart([...cart, {
        productId: product.id,
        productName: product.name,
        price: product.price,
        quantity: 1,
        total: product.price,
      }]);
    }
  };

  const updateQuantity = (productId: string, delta: number) => {
    const item = cart.find(i => i.productId === productId);
    if (!item) return;

    const newQuantity = item.quantity + delta;
    
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart(cart.map(item =>
      item.productId === productId
        ? { ...item, quantity: newQuantity, total: newQuantity * item.price }
        : item
    ));
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.productId !== productId));
  };

  const clearCart = () => {
    setCart([]);
    setDiscount(0);
    setPaymentMode('cash');
    setOnlineAmount(0);
  };

  const handlePaymentModeChange = (mode: 'cash' | 'online' | 'both') => {
    setPaymentMode(mode);
    if (mode !== 'both') {
      setOnlineAmount(0);
    }
  };

  const subtotal = cart.reduce((sum, item) => sum + item.total, 0);
  const discountAmount = (subtotal * discount) / 100;
  const afterDiscount = subtotal - discountAmount;
  const gstAmount = settings.gstOn ? (afterDiscount * settings.gstPercent) / 100 : 0;
  const total = afterDiscount + gstAmount;

  const cashAmount = paymentMode === 'cash' ? total : paymentMode === 'both' ? total - onlineAmount : 0;
  const finalOnlineAmount = paymentMode === 'online' ? total : paymentMode === 'both' ? onlineAmount : 0;

  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Cart is empty',
        description: 'Add items to cart before checkout',
      });
      return;
    }

    if (paymentMode === 'both') {
      if (onlineAmount < 0 || onlineAmount > total) {
        toast({
          variant: 'destructive',
          title: 'Invalid payment amount',
          description: 'Online amount must be between ₹0 and ₹' + total.toFixed(2),
        });
        return;
      }
      if (cashAmount < 0) {
        toast({
          variant: 'destructive',
          title: 'Invalid payment amount',
          description: 'Cash amount cannot be negative',
        });
        return;
      }
    }

    // Get/generate token
    const today = new Date().toISOString().split('T')[0];
    let currentToken = tokens;
    
    if (currentToken.date !== today) {
      currentToken = { date: today, count: 0 };
    }
    
    const tokenNumber = settings.tokenVisible ? currentToken.count + 1 : undefined;
    
    // Update token count
    if (settings.tokenVisible) {
      await setTokens({ ...currentToken, count: tokenNumber! });
    }

    // Create bill
    const newBill: Bill = {
      id: nanoid(),
      dateISO: new Date().toISOString(),
      items: cart,
      subtotal,
      discount: discountAmount,
      gst: gstAmount,
      total,
      token: tokenNumber,
      paymentMode,
      onlineAmount: finalOnlineAmount,
      cashAmount,
    };

    await setBills([newBill, ...bills]);
    setCompletedBill(newBill);
    setCart([]);
    setDiscount(0);
    setPaymentMode('cash');
    setOnlineAmount(0);

    toast({
      title: 'Checkout successful',
      description: `Bill ${tokenNumber ? `#${tokenNumber}` : ''} created`,
    });
  };

  return (
    <>
      {/* Desktop Layout */}
      <div className="hidden md:flex h-[calc(100vh-4rem)]">
        {/* Products Panel - Left */}
        <div className="flex-1 flex flex-col p-6 overflow-hidden">
          <div className="mb-6 space-y-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-12 pl-12"
                data-testid="input-search-products"
              />
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2">
              <Button
                variant={selectedCategory === null ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(null)}
                data-testid="filter-all-categories"
              >
                All
              </Button>
              {categories.map((cat: Category) => (
                <Button
                  key={cat.id}
                  variant={selectedCategory === cat.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(cat.id)}
                  data-testid={`filter-category-${cat.id}`}
                >
                  {cat.name}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No products found</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredProducts.map((product: Product) => {
                  const cartQty = getCartQuantity(product.id);
                  return (
                  <Card
                    key={product.id}
                    className="h-44 p-3 flex flex-col justify-between relative hover-elevate cursor-pointer"
                    onClick={() => addToCart(product)}
                    data-testid={`product-card-${product.id}`}
                  >
                    {cartQty > 0 && (
                      <Badge
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full flex items-center justify-center p-0 text-xs font-bold"
                        data-testid={`product-badge-${product.id}`}
                      >
                        {cartQty}
                      </Badge>
                    )}

                    <div>
                      <h3 className="text-base font-medium line-clamp-2 mb-1">
                        {product.name}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {getCategoryName(product.categoryId)}
                      </p>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-lg font-semibold tabular-nums">
                        ₹{product.price.toFixed(2)}
                      </span>
                      <Button
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCart(product);
                        }}
                        data-testid={`button-add-${product.id}`}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Cart Panel - Right */}
        <div className="w-[400px] border-l flex flex-col bg-card">
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Cart</h2>
              <Badge variant="outline">{cart.length} items</Badge>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-3">
            {cart.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Cart is empty</p>
              </div>
            ) : (
              cart.map((item) => (
                <Card key={item.productId} className="p-4" data-testid={`cart-item-${item.productId}`}>
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium flex-1">{item.productName}</h4>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 -mt-1"
                      onClick={() => removeFromCart(item.productId)}
                      data-testid={`button-remove-${item.productId}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => updateQuantity(item.productId, -1)}
                        data-testid={`button-decrease-${item.productId}`}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center font-medium tabular-nums" data-testid={`quantity-${item.productId}`}>
                        {item.quantity}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => updateQuantity(item.productId, 1)}
                        data-testid={`button-increase-${item.productId}`}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    <span className="font-semibold tabular-nums">
                      ₹{item.total.toFixed(2)}
                    </span>
                  </div>
                </Card>
              ))
            )}
          </div>

          <div className="border-t p-6 space-y-4 bg-background">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="tabular-nums">₹{subtotal.toFixed(2)}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Discount</span>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={discount}
                    onChange={(e) => setDiscount(Math.min(100, Math.max(0, parseFloat(e.target.value) || 0)))}
                    className="h-8 w-16 text-right"
                    data-testid="input-discount"
                  />
                  <span>%</span>
                  <span className="tabular-nums">-₹{discountAmount.toFixed(2)}</span>
                </div>
              </div>

              {settings.gstOn && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">GST ({settings.gstPercent}%)</span>
                  <span className="tabular-nums">+₹{gstAmount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between text-lg font-bold pt-2 border-t">
                <span>Total</span>
                <span className="tabular-nums" data-testid="text-cart-total">₹{total.toFixed(2)}</span>
              </div>
            </div>

            {cart.length > 0 && (
              <div className="border-t pt-4 space-y-3">
                <div>
                  <label className="text-sm font-medium mb-2 block">Payment Mode</label>
                  <Select value={paymentMode} onValueChange={handlePaymentModeChange}>
                    <SelectTrigger className="h-10" data-testid="select-payment-mode">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">
                        <div className="flex items-center gap-2">
                          <Banknote className="h-4 w-4" />
                          <span>Cash</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="online">
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4" />
                          <span>Online</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="both">
                        <div className="flex items-center gap-2">
                          <Wallet className="h-4 w-4" />
                          <span>Both (Mixed)</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {paymentMode === 'online' && (
                  <div>
                    <label className="text-sm font-medium mb-2 block">Online Amount</label>
                    <Input
                      type="number"
                      value={total.toFixed(2)}
                      disabled
                      className="h-10 tabular-nums"
                      data-testid="input-online-amount-disabled"
                    />
                  </div>
                )}

                {paymentMode === 'cash' && (
                  <div>
                    <label className="text-sm font-medium mb-2 block">Cash Amount</label>
                    <Input
                      type="number"
                      value={total.toFixed(2)}
                      disabled
                      className="h-10 tabular-nums"
                      data-testid="input-cash-amount-disabled"
                    />
                  </div>
                )}

                {paymentMode === 'both' && (
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Online Amount</label>
                      <Input
                        type="number"
                        min="0"
                        max={total}
                        value={onlineAmount}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value) || 0;
                          setOnlineAmount(Math.min(total, Math.max(0, value)));
                        }}
                        className="h-10 tabular-nums"
                        data-testid="input-online-amount"
                        placeholder="Enter online amount"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Cash Amount</label>
                      <Input
                        type="number"
                        value={cashAmount.toFixed(2)}
                        disabled
                        className="h-10 tabular-nums bg-muted"
                        data-testid="input-cash-amount"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Button
                className="w-full h-12 font-semibold"
                onClick={handleCheckout}
                disabled={cart.length === 0}
                data-testid="button-checkout"
              >
                <Check className="h-5 w-5 mr-2" />
                Checkout
              </Button>
              {cart.length > 0 && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={clearCart}
                  data-testid="button-clear-cart"
                >
                  Clear Cart
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden">
        <div className="fixed bottom-16 left-0 right-0 top-0 flex flex-col">
          {/* Tab Buttons */}
          <div className="grid grid-cols-2 border-b bg-background">
            <button
              className={cn(
                'py-3 text-sm font-medium border-b-2 transition-colors',
                !showCart
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground'
              )}
              onClick={() => setShowCart(false)}
              data-testid="tab-products"
            >
              Products
            </button>
            <button
              className={cn(
                'py-3 text-sm font-medium border-b-2 transition-colors relative',
                showCart
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground'
              )}
              onClick={() => setShowCart(true)}
              data-testid="tab-cart"
            >
              Cart
              {cart.length > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs">
                  {cart.length}
                </Badge>
              )}
            </button>
          </div>

          {/* Products Tab */}
          {!showCart && (
            <div className="flex-1 flex flex-col p-4 overflow-hidden">
              <div className="mb-4 space-y-3">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="h-11 pl-12"
                  />
                </div>

                <div className="flex gap-2 overflow-x-auto pb-2">
                  <Button
                    variant={selectedCategory === null ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory(null)}
                  >
                    All
                  </Button>
                  {categories.map((cat: Category) => (
                    <Button
                      key={cat.id}
                      variant={selectedCategory === cat.id ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedCategory(cat.id)}
                    >
                      {cat.name}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto">
                <div className="grid grid-cols-2 gap-3 pb-20">
                  {filteredProducts.map((product: Product) => {
                    const cartQty = getCartQuantity(product.id);
                    return (
                    <Card
                      key={product.id}
                      className="h-44 p-3 flex flex-col justify-between relative hover-elevate active-elevate-2"
                      onClick={() => addToCart(product)}
                    >
                      {cartQty > 0 && (
                        <Badge className="absolute -top-2 -right-2 h-6 w-6 rounded-full flex items-center justify-center p-0 text-xs font-bold">
                          {cartQty}
                        </Badge>
                      )}

                      <div>
                        <h3 className="text-sm font-medium line-clamp-2 mb-1">
                          {product.name}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          {getCategoryName(product.categoryId)}
                        </p>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-base font-semibold tabular-nums">
                          ₹{product.price.toFixed(2)}
                        </span>
                        <Button size="icon" className="h-8 w-8">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </Card>
                    );
                  })}
                </div>
              </div>

              {cart.length > 0 && (
                <Button
                  className="fixed bottom-20 right-4 h-14 w-14 rounded-full shadow-lg z-10"
                  size="icon"
                  onClick={() => setShowCart(true)}
                  data-testid="button-floating-cart"
                >
                  <ShoppingCart className="h-6 w-6" />
                  <Badge className="absolute -top-1 -right-1 h-6 w-6 rounded-full p-0 text-xs">
                    {cart.length}
                  </Badge>
                </Button>
              )}
            </div>
          )}

          {/* Cart Tab */}
          {showCart && (
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {cart.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Cart is empty</p>
                  </div>
                ) : (
                  cart.map((item) => (
                    <Card key={item.productId} className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium flex-1">{item.productName}</h4>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => removeFromCart(item.productId)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateQuantity(item.productId, -1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center font-medium tabular-nums">
                            {item.quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateQuantity(item.productId, 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <span className="font-semibold tabular-nums">
                          ₹{item.total.toFixed(2)}
                        </span>
                      </div>
                    </Card>
                  ))
                )}
              </div>

              <div className="border-t p-4 space-y-4 bg-background mb-16">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="tabular-nums">₹{subtotal.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Discount</span>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={discount}
                        onChange={(e) => setDiscount(Math.min(100, Math.max(0, parseFloat(e.target.value) || 0)))}
                        className="h-8 w-16 text-right"
                      />
                      <span>%</span>
                      <span className="tabular-nums">-₹{discountAmount.toFixed(2)}</span>
                    </div>
                  </div>

                  {settings.gstOn && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">GST ({settings.gstPercent}%)</span>
                      <span className="tabular-nums">+₹{gstAmount.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-lg font-bold pt-2 border-t">
                    <span>Total</span>
                    <span className="tabular-nums">₹{total.toFixed(2)}</span>
                  </div>
                </div>

                {cart.length > 0 && (
                  <div className="border-t pt-4 space-y-3">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Payment Mode</label>
                      <Select value={paymentMode} onValueChange={handlePaymentModeChange}>
                        <SelectTrigger className="h-10">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cash">
                            <div className="flex items-center gap-2">
                              <Banknote className="h-4 w-4" />
                              <span>Cash</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="online">
                            <div className="flex items-center gap-2">
                              <CreditCard className="h-4 w-4" />
                              <span>Online</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="both">
                            <div className="flex items-center gap-2">
                              <Wallet className="h-4 w-4" />
                              <span>Both (Mixed)</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {paymentMode === 'online' && (
                      <div>
                        <label className="text-sm font-medium mb-2 block">Online Amount</label>
                        <Input
                          type="number"
                          value={total.toFixed(2)}
                          disabled
                          className="h-10 tabular-nums"
                        />
                      </div>
                    )}

                    {paymentMode === 'cash' && (
                      <div>
                        <label className="text-sm font-medium mb-2 block">Cash Amount</label>
                        <Input
                          type="number"
                          value={total.toFixed(2)}
                          disabled
                          className="h-10 tabular-nums"
                        />
                      </div>
                    )}

                    {paymentMode === 'both' && (
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium mb-2 block">Online Amount</label>
                          <Input
                            type="number"
                            min="0"
                            max={total}
                            value={onlineAmount}
                            onChange={(e) => {
                              const value = parseFloat(e.target.value) || 0;
                              setOnlineAmount(Math.min(total, Math.max(0, value)));
                            }}
                            className="h-10 tabular-nums"
                            placeholder="Enter online amount"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-2 block">Cash Amount</label>
                          <Input
                            type="number"
                            value={cashAmount.toFixed(2)}
                            disabled
                            className="h-10 tabular-nums bg-muted"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="space-y-2">
                  <Button
                    className="w-full h-12 font-semibold"
                    onClick={handleCheckout}
                    disabled={cart.length === 0}
                  >
                    <Check className="h-5 w-5 mr-2" />
                    Checkout
                  </Button>
                  {cart.length > 0 && (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={clearCart}
                    >
                      Clear Cart
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {completedBill && (
        <InvoiceModal
          bill={completedBill}
          settings={settings}
          onClose={() => setCompletedBill(null)}
        />
      )}
    </>
  );
}
