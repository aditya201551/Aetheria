import { useEffect, useRef, useState } from 'react';
import { RemotePlayer } from '../types';
import * as THREE from 'three';

export const useMultiplayer = () => {
  const [otherPlayers, setOtherPlayers] = useState<Record<string, RemotePlayer>>({});
  const [myId, setMyId] = useState<string | null>(null);
  const ws = useRef<WebSocket | null>(null);
  const lastUpdate = useRef<number>(0);

  useEffect(() => {
    // Connect to local Go server
    // Note: In a real deployment, this URL would be an environment variable
    const socket = new WebSocket('ws://localhost:8080/ws');

    socket.onopen = () => {
      console.log('Connected to Aetheria Realm Server');
    };

    socket.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);

        if (msg.type === 'id') {
          setMyId(msg.id);
        } else if (msg.type === 'update') {
          const { id, x, y, z, rotation } = msg.data;
          // Don't update ourself from the server to avoid lag/jitters (client-side prediction)
          if (id !== myId && myId !== null) {
            setOtherPlayers(prev => ({
              ...prev,
              [id]: { id, position: [x, y, z], rotation }
            }));
          }
        } else if (msg.type === 'disconnect') {
          setOtherPlayers(prev => {
            const next = { ...prev };
            delete next[msg.id];
            return next;
          });
        }
      } catch (e) {
        console.error("Error parsing WS message", e);
      }
    };

    socket.onerror = (e) => {
        console.log("Websocket error (Is the backend running?): ", e);
    };

    ws.current = socket;

    return () => {
      socket.close();
    };
  }, [myId]);

  const updateMyPosition = (pos: THREE.Vector3, rotation: number) => {
    if (!ws.current || ws.current.readyState !== WebSocket.OPEN || !myId) return;

    const now = Date.now();
    // Throttle updates to ~20 times per second to save bandwidth
    if (now - lastUpdate.current > 50) { 
      ws.current.send(JSON.stringify({
        x: pos.x,
        y: pos.y,
        z: pos.z,
        rotation
      }));
      lastUpdate.current = now;
    }
  };

  return { otherPlayers, updateMyPosition, myId };
};
