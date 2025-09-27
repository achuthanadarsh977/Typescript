

import {Wrapper} from './CartItem.styles'
import {CartItem} from './CartItem/CartItem'
import { CartItemType } from './App'
import React from 'react';

type Props = {
    cartItems: CartItemType[];
    addToCart: (clickedItem: CartItemType) => void;
    removeFromCart: (id:number) => void
    
}

const Cart: React.FC<Props> = ({cartItems,addToCart,removeFromCart}) =>

    return 