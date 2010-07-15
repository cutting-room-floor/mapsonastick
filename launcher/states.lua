-----------------------
-- Maps on a Stick
-----------------------

-- Menu State
-- Main menu...
Menu = {}
Menu.__index = Menu

function Menu.create()
	local temp = {}
	setmetatable(temp, Menu)
	temp.button = {
          start =  Button.create("Start",  110, 40),
          browse = Button.create("Browse", 110, 70),
					stop =   Button.create("Stop",   110, 100)
        }
	return temp
end

function Menu:draw()
	for n,b in pairs(self.button) do
		b:draw()
	end
end

function Menu:update(dt)
	for n,b in pairs(self.button) do
		b:update(dt)
	end
end

function Menu:mousepressed(x,y,button)
	for n,b in pairs(self.button) do
		if b:mousepressed(x,y,button) then
			if n == "start" then
				Controller.start()
			elseif n == "stop" then
				Controller.stop()
			elseif n == "browse" then
				Controller.browse()
			end
		end
	end
end

function Menu:keypressed(key)
	if key == "escape" then
		love.event.push("q")
	end
end

Controller = {}
Controller.__index = Controller

function Controller.start()
  os.execute('./maps_start')
end

function Controller:stop()
  os.execute('./maps_stop')
end

function Controller:browse()
  os.execute('open http://localhost:5000/')
end
