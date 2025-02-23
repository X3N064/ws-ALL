import socket
import websockets
import asyncio
import traceback

MY_NAME = socket.gethostname()
print(MY_NAME)

MY_IP = socket.gethostbyname(MY_NAME)
print(MY_IP)

with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as s:
    s.connect(('8.8.8.8', 53))
    MY_IP = s.getsockname()[0]
    
    
print(MY_IP)

async def port_scan():
    if not MY_IP[:3] == '192' and not MY_IP[:3] == '10.' and not MY_IP[:3] == '172' :
        print('This is not a private network! SHUTTING DOWN!')
        exit()
    ip_range = MY_IP.split('.')
    ip_range.pop
    ip_range = '.'.join(ip_range)
    print(ip_range)
    
    i = 0
    while i < 255:
        i +=1
        target_ip = f"{ip_range}.{i}"
        print(target_ip)
        uri = f"ws://{target_ip}:1111"
        try:  
            connection = await asyncio.wait_for(websockets.connect(uri), timeout=2)  
            await connection.send('Hello')
            
        except ConnectionRefusedError:
            print('Server connection refused.')
            pass
        except ConnectionError:
            pass
        except:
            traceback.print_exc()

async def register_client(websocket, _):
   async for message in websocket:
       print(message) 

if __name__ == '__main__':
    start_server = websockets.serve(register_client, MY_IP, 1111)
    asyncio.get_event_loop().run_until_complete(start_server)
    asyncio.get_event_loop().run_forever()