all:stage/index.html

init: 
	mkdir -p src/assets
	mkdir -p src/visuals
	mkdir -p src/data
	mkdir -p src/vendor
	mkdir -p src/stage
	mkdir -p build
	mkdir -p dist
	mkdir -p stage

	touch src/data/data.json
	touch src/stage/index.html
	touch src/main.js
	touch src/main.scss
	touch src/stage/stage.scss
	
	touch src/visuals/viz.js
	touch src/visuals/viz.scss

clean: 
	rm -rf build
	mkdir build
	rm -rf dist
	mkdir dist
	rm -rf stage
	mkdir stage
	
cleansoft:
	rm build/*
	rm stage/*

src/vendor/jquery.js: 
	wget "https://cdnjs.cloudflare.com/ajax/libs/jquery/3.3.1/jquery.min.js"  -O src/vendor/jquery.js

src/vendor/lodash.js:
	wget "https://raw.githubusercontent.com/lodash/lodash/4.17.10-npm/lodash.min.js" -O src/vendor/lodash.js
	
src/vendor/d3.js: 
	wget "https://cdnjs.cloudflare.com/ajax/libs/d3/4.13.0/d3.min.js"  -O src/vendor/d3.js


build/vendor.js: src/vendor/jquery.js
build/vendor.js: src/vendor/lodash.js
build/vendor.js: src/vendor/d3.js
	echo "" > build/vendor.0.js
	cat src/vendor/jquery.js >> build/vendor.0.js
	cat src/vendor/lodash.js >> build/vendor.0.js
	cat src/vendor/d3.js >> build/vendor.0.js
	cp build/vendor.0.js build/vendor.js
	

build/datablob.js: ../data/done/timeline.json
	rm -f src/data/*
	cp ../data/done/timeline.json src/data/timeline.json
	python3 bake_data.py > build/datablob.js

build/visuals.js: src/visuals/sortquiz.js
	echo "" > build/visuals.0.js
	cat src/visuals/sortquiz.js >> build/visuals.0.js
	cat build/visuals.0.js > build/visuals.js


build/main.js: src/main.js 
build/main.js: build/visuals.js
	cat src/main.js build/visuals.js > build/main.js


build/logic.js: build/datablob.js
build/logic.js: build/main.js
	cat build/main.js > build/logic.0.js
	npx babel build/logic.0.js  > build/logic.1.js
	cat build/datablob.js build/logic.1.js   > build/logic.2.js
	cp build/logic.2.js build/logic.js
	
build/app.js: build/vendor.js build/logic.js
	cat build/vendor.js build/logic.js > build/app.js

build/app.css: src/visuals/sortquiz.scss 
build/app.css: src/main.scss 
	npx node-sass src/main.scss > build/app.css

stage/index.html: build/app.js src/stage/index.html src/stage/stage.scss build/app.css 
	npx node-sass src/stage/stage.scss > stage/stage.css
	cp build/app.js stage/app.js
	cp src/stage/index.html stage/index.html

dist/app.js: build/app.js
	cp build/app.js  dist/app.js

dist/app.css: build/app.css
	cp build/app.css dist/app.css 

.PHONY: clean deploy init stage

deploy: dist/app.js dist/app.css
	cp -r src/assets/* dist
	# npx uglifyjs dist/app.js > dist/app.min.js
	npx uglifyjs dist/app.js --compress > dist/app.min.js