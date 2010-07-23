Icon = {}
Icon.__index = Icon

function Icon.create(off_img,on_img,x,y,url)
	
	local temp = {}
	setmetatable(temp, Icon)
	temp.width = off_img:getWidth()
	temp.height = off_img:getHeight()
  temp.off_img = off_img
  temp.on_img = on_img
	temp.hover = false -- whether the mouse is hovering over the button
	temp.click = false -- whether the mouse has been clicked on the button
	temp.url = url -- the text in the button
	temp.x = x
	temp.y = y
	return temp
	
end

function Icon:draw()
	
  love.graphics.setColor(unpack(color["overlay"]))
	if self.hover then love.graphics.draw(self.on_img, self.x, self.y)
	else love.graphics.draw(self.off_img, self.x, self.y) end
	
end

function Icon:update(dt)
	
	self.hover = false
	
	local x = love.mouse.getX()
	local y = love.mouse.getY()
	
	if x > self.x
		and x < self.x + self.width
		and y < self.y + self.height
		and y > self.y then
		self.hover = true
	end
	
end

function Icon:mousepressed(x, y, button)
	
	if self.hover then
    os.execute(string.format('open %s', self.url))
	end
	return false
	
end
