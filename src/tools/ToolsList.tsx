import React from 'react'
import {
  FiArrowUpRight,
  FiCircle,
  FiEdit3,
  FiMinus,
  FiSquare,
} from 'react-icons/fi'

import { Arrow, Circle, Line, Pencil, Rectangle } from './index'

export const shapesList = {
  Pencil: { label: 'Pencil', class: Pencil, icon: <FiEdit3 strokeWidth="3" /> },
  Circle: {
    label: 'Circle',
    class: Circle,
    icon: <FiCircle strokeWidth="3" />,
  },
  Rectangle: {
    label: 'Rectangle',
    class: Rectangle,
    icon: <FiSquare strokeWidth="3" />,
  },
  Line: { label: 'Line', class: Line, icon: <FiMinus strokeWidth="3" /> },
  Arrow: {
    label: 'Arrow',
    class: Arrow,
    icon: (
      <FiArrowUpRight strokeWidth="2.5" style={{ transform: 'scale(1.3)' }} />
    ),
  },
} as const
