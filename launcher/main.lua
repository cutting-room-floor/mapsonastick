-----------------------
-- Maps on a Stick
-----------------------

require('button.lua')
require('icon.lua')

function love.load()

	-- Resources
	color =	 {	
        background = {240,243,247},
				link_hover = {40,100,240},
				link = {52,72,89},
				text = {25,25,25},
				overlay = {255,255,255,235} }
	graphics = {
				fullbg = love.graphics.newImage("media/background.png"),
				start_off = love.graphics.newImage("media/start_off.png"),
				start_on = love.graphics.newImage("media/start_on.png") }
  font = {
        default = love.graphics.newFont(24),
				large = love.graphics.newFont(32),
				huge = love.graphics.newFont(72),
				small = love.graphics.newFont(12) }
	
	-- Variables
	size = 6				-- size of the grid
	audio = false		-- whether audio should be on or off
	
	-- Setup
  love.graphics.setBackgroundColor(unpack(color["background"]))

  buttons = {
    ds_link = Button.create('Development Seed', 333, 290, 'http://developmentseed.org/'),
    mapbox_tiles_link = Button.create('mapbox.com/tiles', 188, 270, 'http://mapbox.com/tiles/'),
    start_icon = Icon.create(graphics.start_on, graphics.start_off, 540, 75, 'http://localhost:5000'),
    tos_link = Button.create('Terms of Service', 226, 310, 'http://mapbox.com/tos/') }

  -- Start map server
  pcall(os.execute('./maps_start'))

end


function love.run()

    if love.load then love.load(arg) end

    local dt = 0

    -- Main loop time.
    while true do
        if love.timer then
            love.timer.step()
            dt = love.timer.getDelta()
        end
        if love.update then love.update(dt) end -- will pass 0 if love.timer is disabled
        if love.graphics then
            love.graphics.clear()
            if love.draw then love.draw() end
        end

        -- Process events.
        if love.event then
            for e,a,b,c in love.event.poll() do
                if e == "q" then
                    if love.audio then
                        love.audio.stop()
                    end
                    -- stop map server
                    pcall(os.execute('./maps_stop'))
                    return
                end
                love.handlers[e](a,b,c)
            end
        end

        if love.timer then love.timer.sleep(1) end
        if love.graphics then love.graphics.present() end

    end


end


function love.draw()
  
  love.graphics.setColor(unpack(color["overlay"]))
	love.graphics.draw(graphics["fullbg"], 0, 0, 0, 1, 1, 0, 0)
  love.graphics.setColor(unpack(color["text"]))
  love.graphics.print('Download tiles from', 10, 270)
  love.graphics.print('Maps on a Stick is a project of MapBox and', 10, 290)
  love.graphics.print("2010 Development Seed |", 10, 310)
  for n,b in pairs(buttons) do
		b:draw(dt)
	end

end

function love.update(dt)

 	for n,b in pairs(buttons) do
		b:update(dt)
	end

end

function love.mousepressed(x, y, button)

  for n,b in pairs(buttons) do
		b:mousepressed(x, y, dt)
	end

end

function love.keypressed(key)

	if key == "f4" and (love.keyboard.isDown("ralt") or love.keyboard.isDown("lalt")) then
		love.event.push("q")
	end

end

