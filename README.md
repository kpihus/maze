#About

Implementation of maze solving task with Pololu 3pi and Tessel

![alt tag](https://raw.githubusercontent.com/kpihus/maze/master/event_flow.png)

#Serial commands

Both motors forward: (0xC8, speedLeft[0-127], speedRight[0-127])
Both motors backward: (0xC7, speedLeft[0-127], speedRight[0-127])
Right motor forward: (0xC2, speed[0-127])
Left motor forward: (0xC6, speed[0-127])
Get encoder readings(and clear in 3pi): (0xB7)
Get encoder readings: (0xB8)

