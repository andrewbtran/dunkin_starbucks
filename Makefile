R:

	Rscript -e "rmarkdown::render('data/07-30-2014_pedestrians.Rmd')"
	open data/07-30-2014_pedestrians.html



R_deploy:

	cp data/07-30-2014_pedestrians.html /Volumes/www_html/multimedia/graphics/projectFiles/Rmd/
	rsync -rv data/07-30-2014_pedestrians_files /Volumes/www_html/multimedia/graphics/projectFiles/Rmd
	open http://private.boston.com/multimedia/graphics/projectFiles/Rmd/07-30-2014_pedestrians.html



prepare:

	cd data; rm -rf downloaded; mkdir downloaded;

	# convert crashes to shapefile
	cd data/downloaded; \
		ogr2ogr -f "ESRI Shapefile" pedestriancrashes ../pedestriancrashes.csv; \
		cd pedestriancrashes; \
		cp ../../pedestriancrashes.csv pedestriancrashes.csv; \
		cp ../../pedestriancrashes.vrt pedestriancrashes.vrt; \
		mkdir shp; \
		ogr2ogr -f "ESRI Shapefile" -t_srs EPSG:4326 shp/ pedestriancrashes.vrt;

	# # convert crashes to shapefile
	# cd data/downloaded; \
	# 	cp ../pedestriancrashes.csv ../data.csv; \
	# 	csvgrep ../data.csv -c "City/Town" -r "BOSTON" > ../pedestriancrashes.csv; \
	# 	ogr2ogr -f "ESRI Shapefile" pedestriancrashes ../pedestriancrashes.csv; \
	# 	cd pedestriancrashes; \
	# 	cp ../../pedestriancrashes.csv pedestriancrashes.csv; \
	# 	cp ../../pedestriancrashes.vrt pedestriancrashes.vrt; \
	# 	mkdir shp; \
	# 	ogr2ogr -f "ESRI Shapefile" -t_srs EPSG:4326 -clipsrc 33861.260000 777542.880000 330838.690000 959747.440000 shp/ pedestriancrashes.vrt; \
	# 	mv ../../data.csv ../../pedestriancrashes.csv;

	# download MA outline
	cd data/downloaded; \
		curl http://wsgw.mass.gov/data/gispub/shape/state/outlin.zip > outlin.zip; \
		unzip outlin.zip; \
		ogr2ogr -f "ESRI Shapefile" -s_srs EPSG:26986 -t_srs EPSG:4326 MA.shp outlinp1.shp;

	# download MA towns
	cd data/downloaded; \
		curl http://wsgw.mass.gov/data/gispub/shape/state/towns.zip > towns.zip; \
		unzip towns.zip; \
		ogr2ogr -f "ESRI Shapefile" -t_srs EPSG:4326 MA_TOWNS.shp TOWNS_POLYM.shp;

	# download sub-county population estimates for 2010s
	cd data/downloaded; \
		curl https://www.census.gov/popest/data/cities/totals/2013/files/SUB-EST2013_ALL.csv \
			| iconv -f ISO-8859-1 -t utf-8 \
			| csvgrep -c SUMLEV -r '^040|061' \
			| csvgrep -c STNAME -r 'Massachusetts' \
			| csvsort -c SUMLEV,NAME \
			| csvcut -C SUMLEV,STATE,COUNTY,PLACE,COUSUB,CONCIT,FUNCSTAT,STNAME,CENSUS2010POP,ESTIMATESBASE2010 \
			> towns_2010s.csv

	# download sub-county population estimates for 2000s
	cd data/downloaded; \
		curl https://www.census.gov/popest/data/intercensal/cities/files/SUB-EST00INT.csv \
			| iconv -f ISO-8859-1 -t utf-8 \
			| csvgrep -c SUMLEV -r '^040|061' \
			| csvgrep -c STNAME -r 'Massachusetts' \
			| csvsort -c SUMLEV,NAME \
			| csvcut -C SUMLEV,STATE,COUNTY,PLACE,COUSUB,STNAME,ESTIMATESBASE2000,CENSUS2010POP \
			> towns_2000s.csv

	# create a csv of MA city/town population estimates for 2000-2010s
	cd data/downloaded; \
		csvjoin -c NAME towns_2000s.csv towns_2010s.csv \
		| csvcut -C 13 \
		> towns_2000-2010s.csv

	# get top 5 pedestrian crashes
	cd data/downloaded; \
		ogr2ogr -select CrashCount,NUM_FATAL,NUM_INJURY,NUM_NONINJ,RANK,TOWNS -t_srs EPSG:4326 clusters.shp "http://services.massdot.state.ma.us/ArcGIS/rest/services/Crash/2011CrashClusters/MapServer/3/query?where=RANK%20IN%20(1,2,4,5,7)&outfields=*&f=json" OGRGeoJSON; \
		mapshaper clusters.shp -join ../chatter.csv keys=TOWNS,TOWNS -each "bounds=$$.bounds" -o clusters.json cut-table format=geojson; \
		{ echo 'globe.graphic.clusters='; cat clusters-table.json; echo ';'; } > ../../js/globe.graphic.clusters.js;



encodetiles:

	cd data; \
		rm -rf tiles; mkdir tiles; cd tiles; \
		ogr2ogr -clipsrc -73.508240 41.237962 -69.927802 42.886818 -f CSV -lco GEOMETRY=AS_XY temp.csv ../downloaded/pedestriancrashes/shp/pedestriancrashes.shp; \
		csvcut temp.csv -c 2,1 | tail -n +2 > pedestriancrashes.csv; \
		cat pedestriancrashes.csv | ~/Documents/other/datamaps/encode -o data -z 18;



maketiles:

	cd data/tiles; \
		rm -f test.png; \
		~/Documents/other/datamaps/enumerate \
			-z18 \
			data | \
		xargs \
			-L1 \
			-P8 \
		~/Documents/other/datamaps/render \
			-o pedestriancrashes \
			-t 0 \
			-pg1 \
			-B 10:0.05917:1.23 \
			-c FF0000; \
		mb-util pedestriancrashes pedestriancrashes.mbtiles;



alltiles: encodetiles maketiles