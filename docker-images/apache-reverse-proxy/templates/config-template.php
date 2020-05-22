<?php
	// Retrieve env varaibles
	$staticAppAddress = getenv('STATIC_APP');
	$dynamicAppAddress = getenv('DYNAMIC_APP');
?>

<VirtualHost *:80>
	ServerName labohttp.ch
	
	# animals, cities
	ProxyPass '/api/' 'http://<?php print "$dynamicAppAddress"; ?>/'
	ProxyPassReverse '/api/' 'http://<?php print "$dynamicAppAddress"; ?>/'
	
	# website
	ProxyPass '/' 'http://<?php print "$staticAppAddress"; ?>/'
	ProxyPassReverse '/' 'http://<?php print "$staticAppAddress"; ?>/'
</VirtualHost>
