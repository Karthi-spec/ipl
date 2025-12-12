# End Room Feature

## Overview
The "End Room" feature allows the admin to completely terminate a room, disconnecting all participants and removing the room from the available rooms list.

## How it Works

### For Admin:
1. **Access**: The "End Room" button is available in the Admin Control Panel
2. **Location**: Located next to the "End Auction" button in the auction controls section
3. **Confirmation**: Clicking the button opens a confirmation modal with warnings about the permanent action
4. **Action**: Confirming will:
   - Send a termination signal to all connected participants
   - Remove the room from the server and local storage
   - Reset the auction state
   - Redirect the admin back to the room selection page

### For Participants (Teams/Spectators):
1. **Notification**: When the admin ends the room, all participants receive a notification
2. **Automatic Redirect**: Participants are automatically redirected back to the room selection page
3. **Room Cleanup**: The room is removed from their local room list

## Technical Implementation

### Frontend Components:
- **EndRoomModal**: Confirmation modal with warnings
- **AdminPanel**: Contains the "End Room" button
- **Room Event Listeners**: Added to AuctionRoom, WaitingRoom, and RetentionPhase components
- **Room-based Socket Connection**: Each component connects to specific room on mount

### Backend:
- **Room Isolation**: Each room has its own auction state and client list
- **Socket Rooms**: Uses Socket.IO rooms for efficient broadcasting
- **Room Management**: Automatic cleanup of empty rooms
- **Room-specific Events**: All events are scoped to specific rooms

### Server Architecture:
- **roomStates**: Map of roomId -> auction state
- **roomClients**: Map of roomId -> Set of connected socket IDs
- **adminClients**: Map of roomId -> Set of admin socket IDs
- **Room Broadcasting**: Events only sent to clients in the same room

### Store Updates:
- **RoomStore**: Added `endRoom()` method to handle local room termination
- **Socket Client**: Added `joinRoom()`, `endRoom()` and `onRoomEnded()` methods

### Room Isolation Features:
- **Separate States**: Each room maintains independent auction state
- **Isolated Broadcasting**: Events only affect participants in the same room
- **Clean Termination**: Room data is completely removed when ended
- **Automatic Cleanup**: Empty rooms are automatically cleaned up

## Usage Scenarios

1. **Emergency Termination**: Admin needs to quickly end a problematic session
2. **Planned Conclusion**: Admin wants to formally close the room after auction completion
3. **Technical Issues**: Room needs to be terminated due to technical problems
4. **Inappropriate Behavior**: Admin needs to remove all participants and close the room

## Safety Features

- **Confirmation Modal**: Prevents accidental room termination
- **Admin-Only Access**: Only users with admin role can end rooms
- **Clear Warnings**: Modal explains the permanent nature of the action
- **Graceful Notifications**: Participants receive clear notification about room termination

## Visual Design

- **Button Styling**: Red gradient with warning colors and animated door icon
- **Modal Design**: Glass effect with red borders and warning triangle
- **Notifications**: Styled notification banners for participants
- **Responsive**: Works on all screen sizes

## Error Handling

- **Network Issues**: Handles disconnections gracefully
- **State Cleanup**: Ensures all local state is properly reset
- **Fallback Navigation**: Participants are redirected even if notification fails