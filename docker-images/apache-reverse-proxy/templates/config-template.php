<?php
	$staticAppAddress1 = getenv('STATIC_APP_1');
	$staticAppAddress2 = getenv('STATIC_APP_2');
	$dynamicAppAddress1 = getenv('DYNAMIC_APP_1');
	$dynamicAppAddress2 = getenv('DYNAMIC_APP_2');
?>

<VirtualHost *:80>
	ServerName labohttp.ch

	<Proxy "balancer://dynamic-cluster">
		BalancerMember 'http://<?php print "$dynamicAppAddress1"; ?>'
		BalancerMember 'http://<?php print "$dynamicAppAddress2"; ?>'
	</Proxy>
	
	Header add Set-Cookie "ROUTEID=.%{BALANCER_WORKER_ROUTE}e; path=/" env=BALANCER_ROUTE_CHANGED
	<Proxy "balancer://static-cluster">
		BalancerMember 'http://<?php print "$staticAppAddress1"; ?>/' route=1
		BalancerMember 'http://<?php print "$staticAppAddress2"; ?>/' route=2
		ProxySet stickysession=ROUTEID
	</Proxy>

	# API
	ProxyPass '/api/' 'balancer://dynamic-cluster/'
	ProxyPassReverse '/api/' 'balancer://dynamic-cluster/'

	# Site web static
	ProxyPass '/' 'balancer://static-cluster/'
	ProxyPassReverse '/' 'balancer://mycluster1/'
	
</VirtualHost>
