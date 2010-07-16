-----------------------
-- Maps on a Stick
-----------------------

require("button.lua")
require("states.lua")

function love.load()

	-- Resources
	color =	 {	background = {240,243,247},
				main = {40,40,240},
				text = {25,25,25},
				overlay = {255,255,255,235} }
	font = {	default = love.graphics.newFont(24),
				large = love.graphics.newFont(32),
				huge = love.graphics.newFont(72),
				small = love.graphics.newFont(20) }
	graphics = {logo = love.graphics.newImage("media/logo.png"),
				fmas = love.graphics.newImage("media/fmas.png"),
				fullbg = love.graphics.newImage("media/fullbg.png"),
				set = love.graphics.newImage("media/set.png"),
				start = love.graphics.newImage("media/start.png"),
				notset = love.graphics.newImage("media/notset.png") }
	music =	{	default = love.audio.newSource("media/sawng.ogg") }
	sound =	{	click = love.audio.newSource("media/click.ogg", "static"),
				}
	
	-- Variables
	size = 6				-- size of the grid
	audio = true			-- whether audio should be on or off
	state = Menu.create()	-- current game state
	
	-- Setup
  love.graphics.setBackgroundColor(unpack(color["background"]))

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
	love.graphics.draw(graphics["fullbg"], 0, 0, 0, 0.5, 0.5, 0, 0)
	state:draw()
  
end

function love.update(dt)

	state:update(dt)

end

function love.mousepressed(x, y, button)

	state:mousepressed(x,y,button)

end

function love.keypressed(key)

	if key == "f4" and (love.keyboard.isDown("ralt") or love.keyboard.isDown("lalt")) then
		love.event.push("q")
	end
	state:keypressed(key)

end

