<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

<!--
   question.xsl - Provides translation of the form's XML to HTML
  Copyright 2012, Tariq Yusuf
 
  This file is part of Form Ninja.
 
  Form Ninja is free software: you can redistribute it and/or modify
  it under the terms of the GNU Lesser General Public License as published by
  the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.
 
  Form Ninja is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU General Public License for more details.
 
  You should have received a copy of the GNU Lesser General Public License
  along with Form Ninja.  If not, see <http://www.gnu.org/licenses/>.
 -->

<xsl:template match="application">
	<xsl:apply-templates />
</xsl:template>

<xsl:template match="page">
	<h2 class="page-header">
		<xsl:value-of select="@label" />
	</h2>
	<div class="page">
		<xsl:apply-templates />
	</div>
</xsl:template>

<xsl:template match="section">
	<xsl:element name="fieldset">
		<xsl:attribute name="class">
			section 
			<xsl:if test="@class">
				<xsl:value-of select="@class" />
			</xsl:if>
		</xsl:attribute>
		<xsl:copy-of select="@*[local-name() != 'label']" />
		<legend class="section-header">
			<xsl:value-of select="@label" />
		</legend>
		<xsl:apply-templates />
	</xsl:element>
</xsl:template>

<xsl:template match="text">
	<label class="text-box">
		<xsl:attribute name="for">
			<xsl:value-of select="@name" />
		</xsl:attribute>
		<xsl:value-of select="@label" />
	</label>
	<xsl:element name="input">
			<xsl:attribute name="type">text</xsl:attribute>
			<xsl:attribute name="name">
				<xsl:value-of select="@name" />
			</xsl:attribute>
			<xsl:attribute name="id">
				<xsl:value-of select="@name" />
			</xsl:attribute>
			<xsl:if test="@maxlen">
				<xsl:attribute name="maxlength">
					<xsl:value-of select="@maxlen" />
				</xsl:attribute>
			</xsl:if>
		</xsl:element>
</xsl:template>

<xsl:template match="radio">
	<span class="radio">
		<xsl:value-of select="@label" />
		<xsl:for-each select="choice">
			<xsl:element name="input">
				<xsl:attribute name="type">radio</xsl:attribute>
				<xsl:attribute name="name">
					<xsl:value-of select="../@name" />
				</xsl:attribute>
				<xsl:attribute name="id">
					<xsl:value-of select="generate-id(.)" />
				</xsl:attribute>
				<xsl:attribute name="value">
					<xsl:value-of select="." />
				</xsl:attribute>
			</xsl:element>			
			<label>
				<xsl:attribute name="for">
					<xsl:value-of select="generate-id(.)" />
				</xsl:attribute>
				<xsl:value-of select="." />
			</label>
		</xsl:for-each>
	</span>
</xsl:template>

<xsl:template match="checkbox">
	<span class="checkbox">
		<xsl:value-of select="@label" />
		<xsl:for-each select="choice">
			<xsl:element name="input">
				<xsl:attribute name="type">checkbox</xsl:attribute>
				<xsl:attribute name="name">
					<xsl:value-of select="../@name" />
				</xsl:attribute>
				<xsl:attribute name="id">
					<xsl:value-of select="generate-id(.)" />
				</xsl:attribute>
				<xsl:attribute name="value">
					<xsl:value-of select="." />
				</xsl:attribute>
			</xsl:element>
			<label>
				<xsl:attribute name="for">
					<xsl:value-of select="generate-id(.)" />
				</xsl:attribute>
				<xsl:value-of select="." />
			</label>
		</xsl:for-each>
	</span>
</xsl:template>

<xsl:template match="dropdown">
	<label class="dropdown">
		<xsl:attribute name="for">
			<xsl:value-of select="@name" />
		</xsl:attribute>
		<xsl:value-of select="@label" />
	</label>
	<xsl:element name="select">
		<xsl:attribute name="name">
			<xsl:value-of select="@name" />
		</xsl:attribute>
		<xsl:attribute name="id">
			<xsl:value-of select="@name" />
		</xsl:attribute>
		<xsl:if test="@multiple">
			<xsl:attribute name="size">
                	7
                	</xsl:attribute>
			<xsl:attribute name="multiple">
				<xsl:value-of select="@multiple" />
			</xsl:attribute>
		</xsl:if>
		<xsl:if test="@size">
			<xsl:attribute name="size">
				<xsl:value-of select="@size" />
			</xsl:attribute>
		</xsl:if>
		
		<xsl:for-each select="choice">
			<xsl:element name="option">
				<xsl:if test="@value">
					<xsl:attribute name="value">
						<xsl:value-of select="@value" />
					</xsl:attribute>
				</xsl:if>
				<xsl:value-of select="." />
			</xsl:element>
		</xsl:for-each>
	</xsl:element>
</xsl:template>

<xsl:template match="file">
	<label>
		<xsl:value-of select="@label" />
		<xsl:attribute name="for">
			<xsl:value-of select="@name" />
		</xsl:attribute>
	</label>
	<xsl:element name="input">
		<xsl:attribute name="type">file</xsl:attribute>
		<xsl:attribute name="name">
			<xsl:value-of select="@name" />
		</xsl:attribute>
		<xsl:attribute name="id">
			<xsl:value-of select="@name" />
		</xsl:attribute>
	</xsl:element>
</xsl:template>

<xsl:template match="time-chart">
	<style>
		.timestamp {
			text-align: right;
			width: 40px;
			font-size: 10px;
		}
		.timetable {
			curson: pointer;
		}
		.y, .n {
			width: 100px;
			height: 20px;
			cursor: pointer;
		}
		.y {
			background: url('http://jobs.asuw.org/files/2012/03/YES.png') #8DD7B3 no-repeat center;
		}
		.n {
			background: url('http://jobs.asuw.org/files/2012/03/NO.png') #E99996 no-repeat center;
		}
		#content tr td{
			padding: 0px 5px !important;
		}
		#content table {
			margin: 0 auto !important;
			width: 600px !important;
		}
		.no-select {
			-webkit-touch-callout: none;
			-webkit-user-select: none;
			-khtml-user-select: none;
			-moz-user-select: none;
			-ms-user-select: none;
			user-select: none;
		}
	</style>
	<xsl:element name="script">
		<xsl:attribute name="type">text/javascript</xsl:attribute>
		$(document).ready(function() {
			var startTime = <xsl:value-of select="@start" />;
			var endTime = <xsl:value-of select="@end" />;
			var fieldName = "<xsl:value-of select="@name" />";
			var fieldValue = "<xsl:value-of select="@value" />";
			var id = "<xsl:value-of select="generate-id(.)" />";

			generateTimeChart(id, startTime, endTime, fieldName);
			readTimeString(id, fieldName);
		});
	</xsl:element>
	<p><xsl:value-of select="@label" /></p>
	<table class='no-select' summary="Availability selection">
		<xsl:attribute name="id">
			<xsl:value-of select="generate-id(.)" />
		</xsl:attribute>		
		<tbody class='no-select'>
			<tr class='no-select'>
				<th class='no-select'></th>
				<th class='no-select'>Monday</th>
				<th class='no-select'>Tuesday</th>
				<th class='no-select'>Wednesday</th>
				<th class='no-select'>Thursday</th>
				<th class='no-select'>Friday</th>
			</tr>
		</tbody>
	</table>
	<xsl:element name="input">
		<xsl:attribute name="type">hidden</xsl:attribute>
		<xsl:attribute name="id">
			<xsl:value-of select="@name" />
		</xsl:attribute>
		<xsl:attribute name="name">
			<xsl:value-of select="@name" />
		</xsl:attribute>
		<xsl:attribute name="value">
			<xsl:value-of select="@name" />
		</xsl:attribute>
	</xsl:element>
</xsl:template>

<xsl:template match="ckeditor">
	<label>
		<xsl:attribute name="for">
			<xsl:value-of select="@name" />
		</xsl:attribute>
		<xsl:value-of select="@label" />
	</label>
	<xsl:element name="textarea">
		<xsl:attribute name="cols">
			100
		</xsl:attribute>
		<xsl:attribute name="rows">
                        15
                </xsl:attribute>
		<xsl:attribute name="id">
			<xsl:value-of select="generate-id(.)" />
		</xsl:attribute>
		<xsl:attribute name="name">
			<xsl:value-of select="@name" />
		</xsl:attribute>
		.
	</xsl:element>
	
	<xsl:element name="script" disable-output-escaping="yes">
		<xsl:attribute name="type">text/javascript</xsl:attribute>
		$(document).ready(function() {
			var name = "<xsl:value-of select="generate-id(.)" />";
			$("#" + name).text("");
			CKEDITOR.replace(name, {
				toolbar: 'Basic',
				width: '75%',
			});
		});
	</xsl:element>
</xsl:template>

<xsl:template match="br | div | span | text()">
  <xsl:copy>
    <xsl:apply-templates select="br | div | span | text()" />
  </xsl:copy>
</xsl:template>

</xsl:stylesheet>
