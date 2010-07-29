Button = {}
Button.__index = Button

function Button.create(text,x,y,url)
	
	local temp = {}
	setmetatable(temp, Button)
	temp.hover = false -- whether the mouse is hovering over the button
	temp.click = false -- whether the mouse has been clicked on the button
	temp.text = text -- the text in the button
	temp.url = url -- the text in the button
	temp.width = font["small"]:getWidth(text)
	temp.height = font["small"]:getHeight()
	temp.x = x - (temp.width / 2)
	temp.y = y
	return temp
	
end

function Button:draw()
	
	love.graphics.setFont(font["small"])
	if self.hover then love.graphics.setColor(unpack(color["link_hover"]))
	else love.graphics.setColor(unpack(color["link"])) end
	love.graphics.print(self.text, self.x, self.y)
	
end

function Button:update(dt)
	
	self.hover = false
	
	local x = love.mouse.getX()
	local y = love.mouse.getY()
	
	if x > self.x
		and x < self.x + self.width
		and y > self.y - self.height
		and y < self.y then
		self.hover = true
	end
	
end

function Button:mousepressed(x, y, button)
	
	if self.hover then
    os.execute(string.format('open %s', self.url))
	end
	return false
	
end
