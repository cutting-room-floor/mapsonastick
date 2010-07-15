-----------------------
-- NO: A game of numbers
-- Created: 23.08.08 by Michael Enger
-- Version: 0.2
-- Website: http://www.facemeandscream.com
-- Licence: ZLIB
-----------------------
-- States used.
-----------------------

-- Menu State
-- Main menu...
Menu = {}
Menu.__index = Menu

function Menu.create()
	local temp = {}
	setmetatable(temp, Menu)
	temp.button = {	start = Button.create("Start", 90, 350),
					stop = Button.create("Stop", 200, 350) }
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
  fp = io.popen('moas')
end

function Controller:stop()
  fp:close()
end
