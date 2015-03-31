Local Communication Example
===========================

Run one of the local servers, either `ruby simple_server.rb` or `node simple_server.js`.

###Quick Setup with Node.js

1) Install Node.js on Mac http://nodejs.org/download/

2) Once you're done, download the [simple_server.js](simple_server.js) example from this repo.

3) Start the server from your command line with: 
    
    node simple_server.js

4) Using [Spark Build](https://www.spark.io/build) or [Spark Dev](https://www.spark.io/dev), flash the [firmware.cpp](firmware.cpp) to your device (Core/Photon).

5) Run the following command where IPADDRESS is something like `192.168.1.123`:

    curl https://api.spark.io/v1/devices/0123456789abcdef01234567/connect\
     -d access_token=1234123412341234123412341234123412341234 \
     -d "args=IPADDRESS"


###In-depth Walkthrough

Let's imagine you want to control your device (Core/Photon) locally,
so you build a simple server app to which the device will directly connect.
One puzzle to solve is that you don't know in advance the
IP address of your device or of the laptop that will run the server.
How can the device and the server discover each other?

In this example, we will register a Spark function to pass the
server IP address to the device.  Once we've established the
local connection, we'll be able to control the device without
the data going through the Spark Cloud.

FYI: The following example code is located here: [firmware.cpp](firmware.cpp)

---

```C++
TCPClient client;
```

First, we construct the client that will connect to our local server.

---

```C++
void ipArrayFromString(byte ipArray[], String ipString) {
  int dot1 = ipString.indexOf('.');
  ipArray[0] = ipString.substring(0, dot1).toInt();
  int dot2 = ipString.indexOf('.', dot1 + 1);
  ipArray[1] = ipString.substring(dot1 + 1, dot2).toInt();
  dot1 = ipString.indexOf('.', dot2 + 1);
  ipArray[2] = ipString.substring(dot2 + 1, dot1).toInt();
  ipArray[3] = ipString.substring(dot1 + 1).toInt();
}
```

Then we need a function for translating the IP address String into
the array of four bytes needed by the TCP client.

We work our way progressively through the string, saving the
positions of the dots and the numeric substrings between them.

---

```C++
int connectToMyServer(String ip) {
  byte serverAddress[4];
  ipArrayFromString(serverAddress, ip);

  if (client.connect(serverAddress, 9000)) {
    return 1; // successfully connected
  } else {
    return -1; // failed to connect
  }
}
```

Here's the Spark function we're going to register.
Like all Spark functions it takes a String parameter
and returns an int.  We allocate an array of 4 bytes
for the IP address, then call `ipArrayFromString()`
to convert the String into an array.

After that, we simply call `client.connect()` with the
newly received address! Super simple!

---

```C++
void setup() {
  Spark.function("connect", connectToMyServer);

  for (int pin = D0; pin <= D7; ++pin) {
    pinMode(pin, OUTPUT);
  }
}
```

In `setup()` we only have two jobs:

* Register the Spark function
* Set D0–D7 as output pins

---

```C++
void loop() {
  if (client.connected()) {
    if (client.available()) {
      char pin = client.read() - '0' + D0;
      char level = client.read();
      if ('h' == level) {
        digitalWrite(pin, HIGH);
      } else {
        digitalWrite(pin, LOW);
      }
    }
  }
}
```

In `loop()` we first check whether the client is connected
to the server.  If not, we don't do anything.

If the client is connected, then we ask whether any commands
have been received over local communication.  If not, again,
we don't do anything.

However, if we are *connected* and have *received a command*
then we use the command to perform a `digitalWrite()`.

---

