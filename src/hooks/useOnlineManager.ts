import { useState, useEffect, useCallback } from 'react';
import { Peer, DataConnection } from 'peerjs';
import { GameAction } from '../types';

export const useOnlineManager = (onActionReceived: (action: GameAction) => void) => {
    const [peer, setPeer] = useState<Peer | null>(null);
    const [conn, setConn] = useState<DataConnection | null>(null);
    const [peerId, setPeerId] = useState<string>('');
    const [remotePeerId, setRemotePeerId] = useState<string>('');
    const [connectionStatus, setConnectionStatus] = useState<
        'disconnected' | 'connecting' | 'connected'
    >('disconnected');
    const [isHost, setIsHost] = useState(false);

    // Initialize Peer
    useEffect(() => {
        const newPeer = new Peer();

        newPeer.on('open', (id) => {
            setPeerId(id);
            console.log('My peer ID is: ' + id);
        });

        newPeer.on('connection', (connection) => {
            console.log('Incoming connection from:', connection.peer);
            setupConnection(connection);
            setIsHost(true); // The one who receives connection is host (p1)
        });

        setPeer(newPeer);

        return () => {
            newPeer.destroy();
        };
    }, [setupConnection]);

    const setupConnection = useCallback(
        (connection: DataConnection) => {
            connection.on('open', () => {
                setConnectionStatus('connected');
                setConn(connection);
                setRemotePeerId(connection.peer);
            });

            connection.on('data', (data: any) => {
                console.log('Received data:', data);
                if (data.type === 'GAME_ACTION') {
                    onActionReceived(data.action);
                }
            });

            connection.on('close', () => {
                setConnectionStatus('disconnected');
                setConn(null);
            });
        },
        [onActionReceived]
    );

    const connectToPeer = useCallback(
        (id: string) => {
            if (!peer) return;
            setConnectionStatus('connecting');
            const connection = peer.connect(id);
            setupConnection(connection);
            setIsHost(false); // The one who initiates connection is guest (p2)
        },
        [peer, setupConnection]
    );

    const sendAction = useCallback(
        (action: GameAction) => {
            if (conn && conn.open) {
                conn.send({ type: 'GAME_ACTION', action });
            }
        },
        [conn]
    );

    return {
        peerId,
        remotePeerId,
        connectionStatus,
        isHost,
        connectToPeer,
        sendAction,
    };
};
