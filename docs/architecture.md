# Barber Queue UI Architecture

## Product intent

This UI is a front-end operational board for a barber shop using a smart walk-in queue rather than a traditional booking calendar.

## Main states

### Waiting
Customer is remote and not yet called in.

### Come In Now
Customer has been prompted to head into the shop and is expected to reply/check in.

### In Shop
Customer is physically present and ready to be seated.

### In Chair
Customer is actively being serviced.

### Completed
Customer has finished and collapses into a recent-completions stack.

## Interaction model

### Staff actions
- Tap arrow to move `In Shop -> In Chair`
- Tap barber pill only if override is needed
- Tap `Complete` when service ends

### System actions
- Auto-assignment for `Any barber`
- Auto-selection of preferred barber on move to `In Chair`
- Time-based load display per barber
- Animation and visual emphasis for queue movement

## Queue intelligence

### Service times in current prototype
- Haircut = 30 mins
- Haircut + Beard Shaping = 50 mins
- Haircut + Clipper Over Beard = 40 mins
- Skin Fade = 30 mins
- Fade + Beard = 40 mins
- Standard Cut = 30 mins
- Cut + Beard = 50 mins
- Beard Trim = 15 mins

### Auto-assignment logic
For customers marked `Any`, the system picks the barber with the lowest projected live load.

Projected load is currently:
- Remaining minutes in `In Chair`
- Plus full queued minutes in `In Shop` for already assigned customers

## Live integration direction

### GHL
Use GHL as the system of record for:
- contacts
- pipeline stages
- SMS workflows
- loyalty fields

### n8n
Use n8n as the orchestration layer for:
- queue timing logic
- webhook handling
- barber load calculations
- GHL sync
- event fan-out to UI

### UI
Use this React app as:
- iPad operational screen
- embedded custom menu app in GHL
- live queue state visualization
