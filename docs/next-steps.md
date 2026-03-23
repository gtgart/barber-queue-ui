# Next Steps

## 1. Refactor UI into components
Suggested split:
- `components/QueueColumn.jsx`
- `components/QueueCard.jsx`
- `components/BarberLoadCard.jsx`
- `lib/queueMath.js`

## 2. Add persistent state
Replace in-component state with one of:
- Zustand
- React Context
- TanStack Query + API layer

## 3. Introduce mocked backend
Create a local mock service that supports:
- fetch queue state
- move card to chair
- complete service
- override barber

## 4. Add n8n integration
Likely flow:
- UI action -> webhook
- n8n validates state transition
- n8n updates GHL
- n8n returns canonical state
- UI refreshes from source of truth

## 5. Add GHL mapping
Likely mappings:
- Waiting -> Joined Queue
- Come In Now -> Come In Now Sent
- In Shop -> Checked In
- In Chair -> In Chair
- Completed -> Completed

## 6. Add real service-duration intelligence
Move from static values to:
- barber-specific service timing averages
- elapsed-time based remaining estimates
- historical learning from completed services

## 7. Add iPad polish
- stronger landscape optimization
- larger touch zones
- optional sticky action area
- idle-safe screen mode
