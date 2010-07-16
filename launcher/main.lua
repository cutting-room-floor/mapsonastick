-----------------------
-- Maps on a Stick
-----------------------

function love.load()

	-- Resources
	color =	 {	background = {240,243,247},
				main = {40,40,240},
				text = {25,25,25},
				overlay = {255,255,255,235} }
	graphics = {
				fullbg = love.graphics.newImage("media/fullbg.png"),
				start = love.graphics.newImage("media/start.png"),
				}
	
	-- Variables
	size = 6				-- size of the grid
	audio = false			-- whether audio should be on or off
	
	-- Setup
  love.graphics.setBackgroundColor(unpack(color["background"]))

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
	love.graphics.draw(graphics["fullbg"], 0, 0, 0, 0.5, 0.5, 0, 0)
  
end

function love.update(dt)

end

function love.mousepressed(x, y, button)

  pcall(os.execute('./browse'))

end

function love.keypressed(key)

	if key == "f4" and (love.keyboard.isDown("ralt") or love.keyboard.isDown("lalt")) then
		love.event.push("q")
	end

end

