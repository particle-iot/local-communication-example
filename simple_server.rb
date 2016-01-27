require 'socket'

PORT = 9000

ip = IPSocket.getaddress(Socket.gethostname)

puts <<EOD
OK I'm listening on port #{PORT} here at IP address #{ip}!
Now run the following curl command in another window,
replacing <DEVICE_ID> and <ACCESS_TOKEN>.
curl https://api.particle.io/v1/devices/<DEVICE_ID>/connect -d access_token=<ACCESS_TOKEN> -d ip=#{ip}
EOD

# We'll just block here until someone connects
socket = TCPServer.new(PORT).accept
core_address = socket.peeraddr
puts "Someone connected from #{core_address[3]}:#{core_address[1]}!"

def help
  puts "Commands: 0h  Set pin D0 high"
  puts "          7l  Set pin D7 low"
  puts "              Any pin 0-7 may be set high or low"
  puts "          x   Exit"
end

def handle_input(input, socket)
  case input
  when /^[0-7][lh]$/i
    socket.send input.downcase, 0
  when 'x'
    exit(0)
  else
    help
  end
end

loop do
  print '>> '
  command = gets
  if command.nil?
    break
  else
    handle_input command.chomp!, socket
  end
end
